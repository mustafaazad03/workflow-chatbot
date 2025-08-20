'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Connection,
  Background,
  Controls,
  MarkerType,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import MessageNode, { MessageNodeData } from './MessageNode';
import NodesPanel from './NodesPanel';
import SettingsPanel from './SettingsPanel';
import { Button } from '@/components/ui/button';
import { Save, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const nodeTypes = {
  message: MessageNode,
} as NodeTypes;

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

let nodeId = 1;
const getId = () => `node_${nodeId++}`;

const FlowBuilderContent = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [contextMenu, setContextMenu] = useState<
    | {
        x: number;
        y: number;
        type: 'node' | 'edge';
        targetId: string;
      }
    | null
  >(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      // Check if source handle already has an edge
      const sourceHasEdge = edges.some(
        (edge) => edge.source === params.source && edge.sourceHandle === params.sourceHandle
      );
      
      if (sourceHasEdge) {
        toast({
          title: "Connection Error",
          description: "Source handle can only have one outgoing connection.",
          variant: "destructive",
        });
        return;
      }
      
      // Create edge with arrow marker
      const newEdge = {
        ...params,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
        },
        style: {
          strokeWidth: 1,
        },
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { text: '' },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setContextMenu(null);
  }, []);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, type: 'node', targetId: node.id });
    },
    []
  );

  const onEdgeContextMenu = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, type: 'edge', targetId: edge.id });
  }, []);

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      if (deletedNodes.some((n) => n.id === selectedNode?.id)) {
        setSelectedNode(null);
      }
      if (deletedNodes.length > 0) {
        toast({ title: "Node deleted" });
      }
    },
    [selectedNode]
  );

  const onNodeUpdate = useCallback(
    (nodeId: string, data: MessageNodeData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data };
          }
          return node;
        })
      );
      
      setSelectedNode((current) => 
        current?.id === nodeId ? { ...current, data } : current
      );
    },
    [setNodes]
  );

  const validateFlow = useCallback(() => {
    if (nodes.length <= 1) {
      return true; // Single node or empty flow is valid
    }

    // Find nodes with no incoming edges (no target connections)
    const nodesWithoutTarget = nodes.filter(node => {
      const hasIncomingEdge = edges.some(edge => edge.target === node.id);
      return !hasIncomingEdge;
    });

    // If there are multiple nodes with empty target handles, it's invalid
    if (nodesWithoutTarget.length > 1) {
      return false;
    }

    return true;
  }, [nodes, edges]);

  const handleSave = useCallback(() => {
    if (!validateFlow()) {
      toast({
        title: "Cannot save flow",
        description: "There are multiple nodes with empty target handles. Please connect them properly.",
        variant: "destructive",
      });
      return;
    }

    // Save logic here
    toast({
      title: "Flow saved successfully!",
      description: "Your chatbot flow has been saved.",
    });
  }, [validateFlow]);

  return (
    <div className="flow-builder">
      <div className="flow-canvas" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onEdgeContextMenu={onEdgeContextMenu}
          onNodesDelete={onNodesDelete}
          nodeTypes={nodeTypes}
          deleteKeyCode={["Delete", "Backspace"]}
          fitView
          defaultEdgeOptions={{
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 20,
              height: 20,
            },
            style: {
              strokeWidth: 2,
            },
          }}
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      <div className="flow-panel">
        <div className="flex items-center justify-between p-4 border-b border-panel-border">
          <h2 className="text-xl font-semibold">Flow Builder</h2>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save size={16} />
            Save Changes
          </Button>
        </div>
        
        {selectedNode ? (
          <SettingsPanel
            selectedNode={selectedNode}
            onNodeUpdate={onNodeUpdate}
            onBack={() => setSelectedNode(null)}
          />
        ) : (
          <NodesPanel />
        )}
        
        <div className="flex-1 p-4">
          <div className="text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-1">Flow Rules:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Each source handle can only have one outgoing connection</li>
                  <li>• Target handles can have multiple incoming connections</li>
                  <li>• Multiple unconnected nodes are not allowed when saving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {contextMenu && (
        <div
          className="fixed z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-md border bg-popover text-popover-foreground shadow-md p-1 min-w-[140px]">
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded"
              onClick={() => {
                if (contextMenu.type === 'edge') {
                  setEdges((currentEdges) => currentEdges.filter((e) => e.id !== contextMenu.targetId));
                  toast({ title: 'Edge deleted' });
                } else {
                  const nodeIdToDelete = contextMenu.targetId;
                  setNodes((currentNodes) => currentNodes.filter((n) => n.id !== nodeIdToDelete));
                  setEdges((currentEdges) =>
                    currentEdges.filter((e) => e.source !== nodeIdToDelete && e.target !== nodeIdToDelete)
                  );
                  if (selectedNode?.id === nodeIdToDelete) setSelectedNode(null);
                  toast({ title: 'Node deleted' });
                }
                setContextMenu(null);
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FlowBuilder = () => {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent />
    </ReactFlowProvider>
  );
};

export default FlowBuilder;