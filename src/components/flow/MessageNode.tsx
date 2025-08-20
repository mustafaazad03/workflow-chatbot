'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

export interface MessageNodeData extends Record<string, unknown> {
  text: string;
}

const MessageNode = memo(({ data, selected }: NodeProps) => {
  const messageText = (data as MessageNodeData).text || 'Enter your message...';
  const isPlaceholder = !(data as MessageNodeData).text;

  return (
    <div className={`react-flow__node-message ${selected ? 'selected' : ''}`}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="react-flow__handle-left"
      />
      
      <div className="message-node-header">
        <MessageSquare size={16} />
        <span>Send Message</span>
      </div>
      
      <div className={`message-node-content ${isPlaceholder ? 'placeholder' : ''}`}>
        {messageText}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="react-flow__handle-right"
      />
    </div>
  );
});

MessageNode.displayName = 'MessageNode';

export default MessageNode;