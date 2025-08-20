'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';

const NodesPanel = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="p-4 border-b border-panel-border">
      <h3 className="text-lg font-semibold mb-4">Nodes Panel</h3>
      
      <div className="space-y-3">
        <div
          className="draggable-node p-2 border-2 border-dashed border-flow-node-border rounded-lg bg-flow-node/20 flex items-center gap-2 cursor-grab w-fit"
          draggable
          onDragStart={(event) => onDragStart(event, 'message')}
        >
          <MessageSquare className="text-flow-node-foreground" size={16} />
          <div>
            <div className="font-medium text-flow-node-foreground text-sm">Message</div>
            <div className="text-xs text-muted-foreground">Send a text message</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Drag and drop nodes to the canvas to build your flow
      </div>
    </div>
  );
};

export default NodesPanel;