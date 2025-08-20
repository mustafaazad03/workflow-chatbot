'use client';

import React from 'react';
import { Node } from '@xyflow/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MessageNodeData } from './MessageNode';

interface SettingsPanelProps {
  selectedNode: Node | null;
  onNodeUpdate: (nodeId: string, data: MessageNodeData) => void;
  onBack: () => void;
}

const SettingsPanel = ({ selectedNode, onNodeUpdate, onBack }: SettingsPanelProps) => {
  const handleTextChange = (text: string) => {
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, { ...(selectedNode.data as MessageNodeData), text });
    }
  };

  if (!selectedNode) {
    return null;
  }

  return (
    <div className="p-4 border-b border-panel-border">
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft size={16} />
        </Button>
        <h3 className="text-lg font-semibold">Message</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="node-text" className="text-sm font-medium">
            Text
          </Label>
          <Textarea
            id="node-text"
            placeholder="Enter your message..."
            value={(selectedNode.data as MessageNodeData).text || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleTextChange(e.target.value)}
            className="mt-2 min-h-[100px] resize-none"
          />
        </div>
        
        <div className="text-xs text-muted-foreground">
          This message will be sent when the flow reaches this node.
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;