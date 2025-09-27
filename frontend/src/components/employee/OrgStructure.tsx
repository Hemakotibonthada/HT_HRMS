import type { ReactNode } from 'react';
import { Card } from '../ui/Card';
import type { OrgNode } from '../../types/api';

interface OrgStructureProps {
  structure: OrgNode[];
}

const renderNode = (node: OrgNode): ReactNode => {
  return (
    <li key={node.id} className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-blue-300">{node.department}</p>
        <p className="mt-2 text-lg font-semibold text-white">{node.name}</p>
        <p className="text-sm text-slate-300">{node.title}</p>
        <p className="mt-2 text-xs text-slate-400">{node.email}</p>
      </div>
      {node.children.length > 0 && (
        <ul className="ml-6 border-l border-white/10 pl-6">
          {node.children.map((child) => renderNode(child))}
        </ul>
      )}
    </li>
  );
};

export const OrgStructure = ({ structure }: OrgStructureProps) => {
  return (
    <Card title="Org Structure" subtitle="Live reporting tree">
      {structure.length === 0 ? (
        <p className="text-sm text-slate-300">Org chart will appear once employee records are synchronised.</p>
      ) : (
        <ul className="space-y-6">
          {structure.map((node) => renderNode(node))}
        </ul>
      )}
    </Card>
  );
};
