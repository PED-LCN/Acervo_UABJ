import { useMemo } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useDashboardStore } from "../../state/useDashboardStore";
import { isContentNode } from "../../services/indexer";

const shortName = (path: string): string => {
  if (!path) {
    return "root";
  }
  const parts = path.split("/");
  return parts[parts.length - 1];
};

export const RepositoryGraph = () => {
  const { repository, selectedPath, setSelectedPath, openFile } =
    useDashboardStore();

  const graphData = useMemo(() => {
    if (!repository) {
      return { nodes: [], edges: [] };
    }

    const isSelectedContentNode = Boolean(
      selectedPath &&
        repository.nodesByPath[selectedPath] &&
        isContentNode(repository.nodesByPath[selectedPath]),
    );
    const focusPath = isSelectedContentNode && selectedPath ? selectedPath : "";
    const focusNode = repository.nodesByPath[focusPath];
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    const parentChain: string[] = [];
    let cursorPath: string | null = focusNode.path;
    while (cursorPath !== null && repository.nodesByPath[cursorPath]) {
      parentChain.push(cursorPath);
      cursorPath = repository.nodesByPath[cursorPath].parentPath;
    }
    parentChain.reverse();

    parentChain.forEach((path, index) => {
      nodes.push({
        id: `n-${path}`,
        position: { x: 120 + index * 220, y: 90 },
        data: { label: shortName(path) },
        style: {
          background: path === focusPath ? "#113344" : "#305f77",
          color: "#f4fbff",
          borderRadius: 10,
        },
      });
      if (index > 0) {
        const previous = parentChain[index - 1];
        edges.push({
          id: `e-${previous}-${path}`,
          source: `n-${previous}`,
          target: `n-${path}`,
        });
      }
    });

    focusNode.children
      .slice(0, 120)
      .map((childPath) => repository.nodesByPath[childPath])
      .filter((child) => isContentNode(child))
      .forEach((child, index) => {
        const childPath = child.path;
        nodes.push({
          id: `n-${childPath}`,
          position: {
            x: 120 + (index % 5) * 230,
            y: 260 + Math.floor(index / 5) * 100,
          },
          data: { label: shortName(childPath) },
          style: {
            background: child.type === "dir" ? "#f7fbff" : "#ecf4fb",
            border: "1px solid #8bb2da",
            borderRadius: 8,
          },
        });
        edges.push({
          id: `e-${focusPath}-${childPath}`,
          source: `n-${focusPath}`,
          target: `n-${childPath}`,
        });
      });

    return { nodes, edges };
  }, [repository, selectedPath]);

  return (
    <div className="graph-wrap">
      <ReactFlow
        nodes={graphData.nodes}
        edges={graphData.edges}
        fitView
        onNodeClick={(_, node) => {
          const path =
            node.id.startsWith("n-") || node.id.startsWith("f-")
              ? node.id.slice(2)
              : "";
          if (!path || !repository) {
            return;
          }
          const mapped = repository.nodesByPath[path];
          if (!mapped) {
            return;
          }
          setSelectedPath(mapped.path);
          if (mapped.type === "file") {
            openFile(mapped.path);
          } else {
            openFile(null);
          }
        }}
      >
        <Background color="#d5e3ef" />
        <Controls />
      </ReactFlow>
    </div>
  );
};
