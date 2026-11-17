import React, { useState } from 'react';
import { MermaidViewer } from '../components/common/MermaidViewer.js';
import { Layers, Database, Server, GitMerge, Cpu, Box } from 'lucide-react';

export function ArchitectureExplorerPage() {
  const architectures = [
    {
      id: 'postgres-engine',
      title: 'PostgreSQL Relational Engine: MVCC, Shared Buffers & WAL Subsystems',
      category: 'Database Internals',
      icon: Database,
      description:
        'Internals of PostgreSQL architecture: Postmaster daemon, shared memory (Shared Buffers, WAL Buffers, CLOG), background worker processes (WAL Writer, Checkpointer, Background Writer, Autovacuum), and write-ahead logging durability.',
      rawDefinition: `flowchart TD
    subgraph SharedMemory["PostgreSQL Shared Memory Pool"]
      SB["Shared Buffers (8KB Table/Index Pages)"]
      WB["WAL Buffers (Write-Ahead Log Records)"]
      CLOG["Commit Log (CLOG / pg_xact Status)"]
      LockMgr["Lock Manager (Row/Table Concurrency)"]
    end

    subgraph ClientSessions["Postmaster & Backend Sessions"]
      PM["Postmaster Daemon (Master Listener)"]
      BE1["Backend Process 1 (User Session)"]
      BE2["Backend Process 2 (User Session)"]
      WM1["work_mem / maintenance_work_mem"]
    end

    subgraph BgWorkers["PostgreSQL Background Workers"]
      BGW["Background Writer (bgwriter)"]
      CKPT["Checkpointer (Periodic Flush)"]
      WALW["WAL Writer (Async Flusher)"]
      AV["Autovacuum Launcher & Workers"]
    end

    subgraph PhysicalStorage["Disk Storage Subsystems"]
      BASE["Data Files ($PGDATA/base/...)"]
      WAL["WAL Segments ($PGDATA/pg_wal/...)"]
      ARCH["Archived WAL (PITR & Replication)"]
    end

    PM -->|Forks on connection| BE1
    PM -->|Forks on connection| BE2
    BE1 <-->|Read/Pin Blocks| SB
    BE1 -->|Emit WAL Records| WB
    WB -->|WAL Writer Flush| WAL
    SB -->|Dirty Buffers| BGW
    BGW -->|Smooth Disk Write| BASE
    CKPT -->|Atomic Sync Barrier| BASE
    WAL -->|Archive Command / pg_receivewal| ARCH
`,
      legend: [
        { key: 'Shared Buffers', label: 'In-memory caching of table & index disk pages', color: '#38bdf8' },
        { key: 'WAL Writer', label: 'Guarantees transaction durability prior to COMMIT return', color: '#f59e0b' },
        { key: 'Checkpointer', label: 'Flushes all dirty buffers and writes checkpoint record', color: '#10b981' },
      ],
    },
    {
      id: 'k8s-control-plane',
      title: 'Kubernetes Production Control Plane & Worker Node Topologies',
      category: 'DevOps & Cloud-Native',
      icon: Server,
      description:
        'Control loop data flows between kube-apiserver, etcd consensus distributed datastore, kube-scheduler, kube-controller-manager, and worker node kubelet & container runtime.',
      rawDefinition: `flowchart TD
    subgraph ControlPlane["Kubernetes Control Plane"]
      API["kube-apiserver\\n(Declarative REST API)"]
      ETCD[("etcd\\n(Raft Distributed Key-Value)")]
      SCHED["kube-scheduler\\n(Pod Node Assignment)"]
      CTRL["kube-controller-manager\\n(Reconciliation Loops)"]
    end

    subgraph WorkerNode1["Worker Node 01"]
      KUBELET1["kubelet"]
      PROXY1["kube-proxy"]
      CRI1["CRI Container Runtime (containerd)"]
      POD1["Pod A (App)"]
    end

    subgraph WorkerNode2["Worker Node 02"]
      KUBELET2["kubelet"]
      PROXY2["kube-proxy"]
      CRI2["CRI Container Runtime (containerd)"]
      POD2["Pod B (App)"]
    end

    API <-->|State Persistence| ETCD
    API <-->|Node Binding| SCHED
    API <-->|Reconciliation State| CTRL
    API <-->|Node Status & Heartbeats| KUBELET1
    API <-->|Node Status & Heartbeats| KUBELET2
    KUBELET1 -->|Direct Pod Lifecycle| CRI1
    CRI1 --> POD1
    KUBELET2 -->|Direct Pod Lifecycle| CRI2
    CRI2 --> POD2
`,
      legend: [
        { key: 'API', label: 'kube-apiserver authentication and schema validation', color: '#06b6d4' },
        { key: 'ETCD', label: 'etcd cluster state consensus store', color: '#6366f1' },
        { key: 'CRI', label: 'Container Runtime Interface container execution', color: '#10b981' },
      ],
    },
    {
      id: 'saga-pattern',
      title: 'Microservices Distributed Saga Choreography & Event Sourcing',
      category: 'Software Architecture',
      icon: GitMerge,
      description:
        'Distributed transaction management implementing event-driven compensating transactions without two-phase commit (2PC) locks across isolated databases.',
      rawDefinition: `sequenceDiagram
    autonumber
    actor Client
    participant OrderService as Order Service
    participant EventBus as Event Bus (Kafka)
    participant PaymentService as Payment Service
    participant InventoryService as Inventory Service

    Client->>OrderService: Create Order (Pending)
    OrderService->>EventBus: Publish 'OrderCreatedEvent'
    EventBus->>PaymentService: Consume 'OrderCreatedEvent'
    PaymentService->>PaymentService: Authorize Credit Card
    PaymentService-->>EventBus: Publish 'PaymentAuthorizedEvent'
    EventBus->>InventoryService: Consume 'PaymentAuthorizedEvent'
    InventoryService->>InventoryService: Reserve Stock
    InventoryService-->>EventBus: Publish 'StockReservedEvent'
    EventBus->>OrderService: Consume 'StockReservedEvent'
    OrderService->>OrderService: Mark Order as 'Approved'
    OrderService-->>Client: Return Order Complete
`,
      legend: [
        { key: 'EventBus', label: 'Durable event log (Apache Kafka topic partitions)', color: '#f59e0b' },
        { key: 'Saga', label: 'Asynchronous eventual consistency orchestration', color: '#3b82f6' },
      ],
    },
    {
      id: 'react-fiber',
      title: 'React 19 Fiber Architecture: Concurrent Reconciliation & WorkLoop',
      category: 'Frontend Engineering',
      icon: Cpu,
      description:
        'Double-buffering Fiber reconciliation architecture showing current and workInProgress trees, incremental priority scheduling, interruptible render phase, and atomic commit DOM mutations.',
      rawDefinition: `flowchart TD
    subgraph HostScheduler["React Concurrent Scheduler"]
      TASK["Scheduler MessageChannel Microtask"]
      PRIO["Lane Priority Matrix (Sync, Default, Idle)"]
    end

    subgraph RenderPhase["Render Phase (Interruptible, Pure)"]
      WIP["WorkInProgress Fiber Tree"]
      CURR["Current Fiber Tree (Rendered UI)"]
      DIFF["Reconciliation / Diffing Algorithm"]
    end

    subgraph CommitPhase["Commit Phase (Synchronous, Atomic)"]
      BEFORE["Before Mutation (getSnapshotBeforeUpdate)"]
      MUT["Mutation (DOM Inserts / Deletions)"]
      LAYOUT["Layout Effects (useLayoutEffect)"]
      PASSIVE["Passive Effects (useEffect)"]
    end

    TASK --> PRIO
    PRIO --> WIP
    CURR <-->|Alternate Pointers| WIP
    WIP --> DIFF
    DIFF --> BEFORE
    BEFORE --> MUT
    MUT --> LAYOUT
    LAYOUT --> PASSIVE
`,
      legend: [
        { key: 'Fiber', label: 'Unit of computational work representing a virtual component node', color: '#06b6d4' },
        { key: 'Render Phase', label: 'Non-blocking, interruptible virtual DOM tree diffing', color: '#38bdf8' },
        { key: 'Commit Phase', label: 'Synchronous atomic application of updates to host DOM', color: '#10b981' },
      ],
    },
    {
      id: 'linux-containers',
      title: 'Linux Container Isolation: Namespaces, Cgroups v2 & containerd',
      category: 'Platform Engineering',
      icon: Box,
      description:
        'Kernel primitive isolation mechanisms combining 8 Linux namespaces (PID, NET, IPC, MNT, UTS, USER, CGROUP, TIME), cgroups v2 resource quotas, and OverlayFS layered rootfs.',
      rawDefinition: `flowchart TD
    subgraph UserSpace["Host User Space"]
      DOCKER["containerd / runc Runtime"]
      OCI["OCI Bundle (config.json + rootfs)"]
    end

    subgraph KernelPrimitives["Linux Kernel Isolation Boundary"]
      subgraph Namespaces["Namespaces (Visibility Virtualization)"]
        PID_NS["PID: Isolated Process Hierarchy"]
        NET_NS["NET: Veth Virtual Network Interface"]
        MNT_NS["MNT: Pivot_Root / Mount Tree"]
        IPC_NS["IPC: POSIX Message Queues & Semaphores"]
      end

      subgraph Cgroups["Cgroups v2 (Resource Metering & Limits)"]
        CPU_LIM["cpu.max (CFS Bandwidth Quotas)"]
        MEM_LIM["memory.max (OOM Killer Enforcement)"]
        IO_LIM["io.max (IOPS & Bandwidth Limits)"]
      end

      subgraph StorageDriver["Storage Virtualization"]
        OVERLAY["OverlayFS (lowerdir, upperdir, workdir)"]
      end
    end

    subgraph IsolatedContainer["Isolated Container Environment"]
      APP["Container Process (PID 1 in NS)"]
      ETH["eth0 Interface (Bridge IP)"]
      FS["Merged Root Filesystem (/)"]
    end

    DOCKER --> OCI
    OCI --> PID_NS
    OCI --> NET_NS
    OCI --> MNT_NS
    OCI --> CPU_LIM
    OCI --> MEM_LIM
    OCI --> OVERLAY
    PID_NS --> APP
    NET_NS --> ETH
    OVERLAY --> FS
`,
      legend: [
        { key: 'Namespaces', label: 'Controls what processes can see (PID, NET, MNT)', color: '#a855f7' },
        { key: 'Cgroups v2', label: 'Controls how much system resources processes can consume', color: '#ef4444' },
        { key: 'OverlayFS', label: 'Copy-On-Write layered storage driver for container rootfs', color: '#10b981' },
      ],
    },
    {
      id: 'oracle-engine',
      title: 'Oracle Database Engine: Instance Memory & Disk Subsystems',
      category: 'Database Internals',
      icon: Database,
      description:
        'Detailed architectural overview of System Global Area (SGA), Program Global Area (PGA), background processes (DBWn, LGWR, CKPT), and physical storage files (Datafiles, Online Redo Logs, Control Files).',
      rawDefinition: `flowchart TD
    subgraph Host Memory
      subgraph SGA["System Global Area (SGA)"]
        DBC["Database Buffer Cache\\n(Default, Keep, Recycle)"]
        SP["Shared Pool\\n(Library Cache, Dictionary Cache)"]
        RLB["Redo Log Buffer\\n(Circular Ring Buffer)"]
        LP["Large Pool / Java Pool / In-Memory"]
      end
      PGA["Program Global Area (PGA)\\n(Sort Area, Hash Area, Session State)"]
    end

    subgraph Processes["Oracle Background Processes"]
      DBWn["DBWn (Database Writer)"]
      LGWR["LGWR (Log Writer)"]
      CKPT["CKPT (Checkpoint Process)"]
      SMON["SMON (System Monitor)"]
      PMON["PMON (Process Monitor)"]
    end

    subgraph Storage["Disk Subsystem (ASM / Filesystem)"]
      DF["Datafiles (*.dbf)"]
      RLF["Online Redo Log Files (*.log)"]
      CF["Control Files (*.ctl)"]
      AF["Archived Redo Logs"]
    end

    DBC -->|Dirty Blocks| DBWn
    DBWn -->|Writes asynchronous batches| DF
    RLB -->|Redo records| LGWR
    LGWR -->|Atomic flush on COMMIT| RLF
    CKPT -->|Updates headers| DF
    CKPT -->|Sync scn & checkpoints| CF
    RLF -->|Log switch archive| AF
`,
      legend: [
        { key: 'SGA', label: 'System Global Area (Shared across all user processes)', color: '#38bdf8' },
        { key: 'LGWR', label: 'Log Writer ensuring durability prior to COMMIT ACK', color: '#f59e0b' },
        { key: 'DBWn', label: 'Deferred asynchronous database block flush engine', color: '#10b981' },
      ],
    },
  ];

  const [selectedArch, setSelectedArch] = useState(architectures[0]!);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-cyber-400 font-semibold mb-1">
          <Layers className="h-4 w-4" />
          <span>Interactive Visualizer</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          System Architecture Explorer
        </h1>
        <p className="text-xs sm:text-sm text-dark-muted mt-1 max-w-3xl leading-relaxed">
          Explore production-grade internal mechanics, memory lifecycles, and distributed communication flows
          across databases, operating systems, cloud orchestration, and frontend runtimes.
        </p>
      </div>

      {/* Architecture Selection Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {architectures.map((arch) => {
          const Icon = arch.icon;
          const active = arch.id === selectedArch.id;
          return (
            <button
              key={arch.id}
              onClick={() => setSelectedArch(arch)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                active
                  ? 'border-cyber-500 bg-cyber-500/10 shadow-neon-cyan'
                  : 'border-dark-border bg-dark-card hover:border-dark-borderHover hover:bg-dark-cardHover'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`p-2 rounded-xl ${
                    active ? 'bg-cyber-500 text-white' : 'bg-dark-surface text-cyber-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-dark-muted font-mono">
                    {arch.category}
                  </span>
                  <h3 className="text-xs font-bold text-white truncate max-w-[200px]">
                    {arch.title}
                  </h3>
                </div>
              </div>
              <p className="text-[11px] text-dark-muted line-clamp-2">{arch.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Architecture Viewer */}
      <div className="space-y-4">
        <MermaidViewer
          id={selectedArch.id}
          title={selectedArch.title}
          description={selectedArch.description}
          definition={selectedArch.rawDefinition}
          legend={selectedArch.legend}
        />
      </div>
    </div>
  );
}
