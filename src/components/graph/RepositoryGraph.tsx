import { useMemo } from 'react'
import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react'
import { useDashboardStore } from '../../state/useDashboardStore'

const shortName = (path: string): string => {
  if (!path) {
    return 'root'
  }
  const parts = path.split('/')
  return parts[parts.length - 1]
}

export const RepositoryGraph = () => {
  const { repository, selectedPath, graphMode, setSelectedPath, openFile } = useDashboardStore()

  const graphData = useMemo(() => {
    if (!repository) {
      return { nodes: [], edges: [] }
    }

    if (graphMode === 'semantic') {
      const nodes: Node[] = []
      const edges: Edge[] = []
      const files = repository.filePaths.slice(0, 120).map((path) => repository.nodesByPath[path])

      const disciplineMap = new Map<string, Set<string>>()
      files.forEach((file) => {
        const parts = file.path.split('/')
        const discipline = parts.length >= 3 && parts[0] === 'periodos' ? parts[2] : 'geral'
        if (!disciplineMap.has(discipline)) {
          disciplineMap.set(discipline, new Set())
        }
        disciplineMap.get(discipline)?.add(file.category)
      })

      let disciplineIndex = 0
      disciplineMap.forEach((categories, discipline) => {
        const disciplineId = `d-${discipline}`
        nodes.push({
          id: disciplineId,
          position: { x: 80, y: 100 + disciplineIndex * 120 },
          data: { label: discipline },
          style: { background: '#112740', color: '#f5f9ff', borderRadius: 10 },
        })

        let categoryIndex = 0
        categories.forEach((category) => {
          const categoryId = `c-${discipline}-${category}`
          nodes.push({
            id: categoryId,
            position: { x: 320, y: 70 + disciplineIndex * 120 + categoryIndex * 34 },
            data: { label: category },
            style: { background: '#264f75', color: '#eaf7ff', borderRadius: 10 },
          })
          edges.push({ id: `${disciplineId}-${categoryId}`, source: disciplineId, target: categoryId })
          categoryIndex += 1
        })

        disciplineIndex += 1
      })

      files.slice(0, 80).forEach((file, index) => {
        const parts = file.path.split('/')
        const discipline = parts.length >= 3 && parts[0] === 'periodos' ? parts[2] : 'geral'
        const categoryId = `c-${discipline}-${file.category}`
        const fileId = `f-${file.path}`

        nodes.push({
          id: fileId,
          position: { x: 600, y: 40 + index * 28 },
          data: { label: shortName(file.path) },
          style: { background: '#f8fbff', border: '1px solid #8cb3d9', borderRadius: 8 },
        })
        edges.push({ id: `${categoryId}-${fileId}`, source: categoryId, target: fileId })
      })

      return { nodes, edges }
    }

    const focusPath = selectedPath && repository.nodesByPath[selectedPath] ? selectedPath : ''
    const focusNode = repository.nodesByPath[focusPath]
    const nodes: Node[] = []
    const edges: Edge[] = []

    const parentChain: string[] = []
    let cursorPath: string | null = focusNode.path
    while (cursorPath !== null && repository.nodesByPath[cursorPath]) {
      parentChain.push(cursorPath)
      cursorPath = repository.nodesByPath[cursorPath].parentPath
    }
    parentChain.reverse()

    parentChain.forEach((path, index) => {
      nodes.push({
        id: `n-${path}`,
        position: { x: 120 + index * 220, y: 90 },
        data: { label: shortName(path) },
        style: {
          background: path === focusPath ? '#113344' : '#305f77',
          color: '#f4fbff',
          borderRadius: 10,
        },
      })
      if (index > 0) {
        const previous = parentChain[index - 1]
        edges.push({ id: `e-${previous}-${path}`, source: `n-${previous}`, target: `n-${path}` })
      }
    })

    focusNode.children.slice(0, 80).forEach((childPath, index) => {
      const child = repository.nodesByPath[childPath]
      nodes.push({
        id: `n-${childPath}`,
        position: { x: 120 + (index % 5) * 230, y: 260 + Math.floor(index / 5) * 100 },
        data: { label: shortName(childPath) },
        style: {
          background: child.type === 'dir' ? '#f7fbff' : '#ecf4fb',
          border: '1px solid #8bb2da',
          borderRadius: 8,
        },
      })
      edges.push({ id: `e-${focusPath}-${childPath}`, source: `n-${focusPath}`, target: `n-${childPath}` })
    })

    return { nodes, edges }
  }, [graphMode, repository, selectedPath])

  return (
    <div className="graph-wrap">
      <ReactFlow
        nodes={graphData.nodes}
        edges={graphData.edges}
        fitView
        onNodeClick={(_, node) => {
          const path = node.id.startsWith('n-') || node.id.startsWith('f-') ? node.id.slice(2) : ''
          if (!path || !repository) {
            return
          }
          const mapped = repository.nodesByPath[path]
          if (!mapped) {
            return
          }
          setSelectedPath(mapped.path)
          if (mapped.type === 'file') {
            openFile(mapped.path)
          }
        }}
      >
        <Background color="#d5e3ef" />
        <Controls />
      </ReactFlow>
    </div>
  )
}
