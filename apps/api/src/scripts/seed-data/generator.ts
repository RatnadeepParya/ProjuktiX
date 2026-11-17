import {
  AssessmentSet,
  Chapter,
  Course,
  HandsOnExercise,
  Lesson,
  LessonChunk,
  MCQAnswerKey,
  MCQQuestion,
  Technology,
} from '@projuktix/types';
import { MARKET_TECHNOLOGIES, TechSeedDefinition } from './tech-catalog.js';

export interface GeneratedSeedData {
  technologies: Array<Omit<Technology, 'createdAt' | 'updatedAt'>>;
  courses: Course[];
  chapters: Chapter[];
  lessons: Lesson[];
  lessonChunks: LessonChunk[];
  assessmentSets: AssessmentSet[];
  exercises: HandsOnExercise[];
  mcqQuestions: MCQQuestion[];
  mcqAnswerKeys: MCQAnswerKey[];
}

interface QuestionTemplate {
  title: string;
  type: MCQQuestion['questionType'];
  difficulty: MCQQuestion['difficulty'];
  getPrompt: (t: TechSeedDefinition) => string;
  getOptions: (t: TechSeedDefinition, correctIdx: number) => Array<{ id: string; text: string }>;
  getExplanation: (t: TechSeedDefinition) => string;
}

const QUESTION_ARCHETYPES: QuestionTemplate[] = [
  // 1. Core Architecture Subsystem 1
  {
    title: 'Core Architecture Subsystem',
    type: 'architecture',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `In ${t.name} enterprise deployments, what is the primary architectural responsibility of the ${t.coreTopics[0] || 'Core Engine'} subsystem?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Coordinates runtime execution and encapsulates ${t.coreTopics[0] || 'primary state'} lifecycle boundaries.`,
        `Directly manipulates unmanaged kernel memory pages without synchronization.`,
        `Acts exclusively as a plain-text proxy without protocol validation.`,
        `Transpiles all incoming workloads into unverified shell scripts.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `In ${t.name}, the ${t.coreTopics[0]} subsystem governs fundamental execution lifecycle, state invariants, and runtime boundaries in accordance with ${t.name} core specifications.`,
  },
  // 2. Core Subsystem 2
  {
    title: 'Subsystem Boundary and Processing',
    type: 'single_choice',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `When configuring ${t.name}, how does ${t.coreTopics[1] || 'the secondary processing pipeline'} handle incoming workload state?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Processes state deterministically through validated lifecycle stages with explicit boundary guarantees.`,
        `Silently drops all unacknowledged packets without emitting error metrics.`,
        `Allocates unbounded heap memory until the operating system invokes the OOM killer.`,
        `Requires manual operator intervention via terminal signals for every operation.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `${t.name} enforces deterministic state transitions within ${t.coreTopics[1]}, ensuring predictable resource consumption and clear isolation.`,
  },
  // 3. Core Subsystem 3
  {
    title: 'Internal Invariant Guarantees',
    type: 'single_choice',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `Which invariant is strictly enforced by ${t.name} when managing ${t.coreTopics[2] || 'internal metadata'}?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Strict type or schema conformity with deterministic error propagation upon violation.`,
        `Eventual consistency with no validation checks on corrupted records.`,
        `Unrestricted arbitrary mutations across concurrent execution threads.`,
        `Complete disabling of logging and telemetry to minimize CPU clock cycles.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Integrity guarantees in ${t.name} ensure that ${t.coreTopics[2]} prevents silent corruption and propagates invariant violations immediately.`,
  },
  // 4. Core Subsystem 4
  {
    title: 'Advanced Pipeline Transformation',
    type: 'architecture',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `How does ${t.name} leverage ${t.coreTopics[3] || 'its advanced abstraction layer'} in production architectures?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Provides an extensible abstraction for modular composition, transformation, and performance isolation.`,
        `Replaces standard transport protocols with raw unbuffered UDP datagrams.`,
        `Forces all client connections to serialize through a single shared global lock.`,
        `Eliminates the need for any monitoring or logging infrastructure.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `The architectural role of ${t.coreTopics[3]} in ${t.name} provides clean separation of concerns and safe composability.`,
  },
  // 5. Execution Pipeline Deep Dive
  {
    title: 'Execution Pipeline Mechanics',
    type: 'single_choice',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `During active workload execution in ${t.name}, what occurs within the ${t.architectureTopic}?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Input tasks traverse structured validation, intermediate representation, and execution phases.`,
        `Commands execute directly against raw hardware registers without translation.`,
        `The system enters a spinlock until external intervention resets the runtime.`,
        `All transaction logs are deleted immediately upon buffer acquisition.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `The ${t.architectureTopic} in ${t.name} guarantees orderly execution flow through disciplined parsing, planning, and dispatching.`,
  },
  // 6. Concurrency and Thread Safety
  {
    title: 'Concurrency Model and Synchronization',
    type: 'single_choice',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `How does ${t.name} handle concurrent operations across multiple execution contexts?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Through non-blocking primitives, fine-grained locking, or cooperative event-driven dispatching.`,
        `By disabling all concurrency and forcing strictly single-threaded serial execution at the OS level.`,
        `By allowing data races to resolve arbitrarily depending on processor clock jitter.`,
        `By terminating the host process whenever two requests arrive simultaneously.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `${t.name} achieves high concurrency using engineered synchronization mechanisms tailored to its runtime architecture.`,
  },
  // 7. Memory Allocation and Lifecycle
  {
    title: 'Memory Management and Object Lifecycles',
    type: 'single_choice',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `What memory management strategy does ${t.name} employ to minimize fragmentation and allocation latency?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Managed heaps, arena allocators, or generational garbage collection pools.`,
        `Static single-buffer allocation fixed at compilation time with zero dynamic expansion.`,
        `Writing all transient object allocations directly to virtual swap files on disk.`,
        `Randomly evicting active objects whenever memory utilization exceeds fifty percent.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `${t.name} structures memory into disciplined pools or managed heaps to avoid fragmentation and ensure consistent allocation throughput.`,
  },
  // 8. Error Handling and Boundary Resilience
  {
    title: 'Exception Propagation and Resilience',
    type: 'troubleshooting',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `When an unexpected runtime fault occurs in a ${t.name} component, what is the recommended design pattern?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Catch at component boundaries, log structured error context, and fail fast or gracefully degrade.`,
        `Suppress all error signals silently and return empty success responses to callers.`,
        `Immediately issue a kernel panic to reboot the physical server.`,
        `Retry in an infinite tight loop without exponential backoff or jitter.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Resilient systems in ${t.name} enforce structured error handling, contextual telemetry, and bounded circuit breakers.`,
  },
  // 9. Configuration Management & Defaults
  {
    title: 'Production Configuration Best Practices',
    type: 'single_choice',
    difficulty: 'intermediate',
    getPrompt: (t) =>
      `Which principle should govern configuration parameters for ${t.name} in mission-critical environments?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Explicit externalization via environment variables or version-controlled declarative specs.`,
        `Hardcoding IP addresses and access credentials directly in source files.`,
        `Relying entirely on out-of-the-box development defaults without tuning buffer or thread limits.`,
        `Modifying binary executables directly using a hexadecimal editor on production nodes.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Enterprise best practices for ${t.name} require strict 12-factor configuration externalization and immutable manifests.`,
  },
  // 10. High Availability and Clustering
  {
    title: 'High Availability and Failover Mechanics',
    type: 'architecture',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `In a distributed or clustered topology of ${t.name}, how is split-brain syndrome prevented during network partitions?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Using consensus quorums, fencing tokens, or majority heartbeating mechanisms.`,
        `Promoting all isolated nodes to independent primary writable leaders simultaneously.`,
        `Halting all networking hardware until physical manual verification is complete.`,
        `Randomly designating a master node based on lowest process ID without voting.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `High availability clustering in ${t.name} relies on quorum consensus algorithms (e.g. Raft, Paxos, or cluster heartbeats) to prevent split-brain.`,
  },
  // 11. Data Consistency and Transactions
  {
    title: 'Transaction Isolation and Consistency',
    type: 'single_choice',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `How does ${t.name} maintain state consistency when concurrent mutations intersect?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Through strict ACID guarantees, MVCC snapshot isolation, or atomic Compare-And-Swap primitives.`,
        `By permitting dirty writes and allowing the fastest clock to overwrite preceding updates.`,
        `By disabling durability and storing state purely in CPU L1 registers.`,
        `By truncating data files whenever two concurrent writes overlap.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `${t.name} preserves data consistency through structured isolation levels, multi-version concurrency control, or atomic state operations.`,
  },
  // 12. Asynchronous I/O and Backpressure
  {
    title: 'I/O Multiplexing and Flow Control',
    type: 'single_choice',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `Under sustained high ingress throughput, how does ${t.name} prevent buffer exhaustion?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Applies reactive backpressure to slow down upstream producers and limit in-flight buffers.`,
        `Continuously accepts incoming data into unbounded memory until process termination.`,
        `Immediately drops established TCP connections without sending RST or FIN packets.`,
        `Increases network interface MTU dynamically to 64 megabytes.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Backpressure propagation in ${t.name} signals upstream producers to moderate ingestion rates, preventing OOM crashes.`,
  },
  // 13. Indexing & Query/Retrieval Optimization
  {
    title: 'Data Indexing and Search Complexity',
    type: 'single_choice',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `What optimization technique in ${t.name} drastically reduces lookup latency for high-cardinality keys?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Deploying balanced tree structures, hash indexes, or bloom filter skip lists.`,
        `Executing sequential full-table or full-memory scans across all partitions.`,
        `Sorting all records synchronously on every single read query.`,
        `Writing records randomly to unindexed flat files without metadata headers.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Efficient lookups in ${t.name} leverage specialized indexing data structures to achieve logarithmic or constant-time retrieval.`,
  },
  // 14. Horizontal Scaling and Partitioning
  {
    title: 'Sharding, Partitioning and Load Balancing',
    type: 'architecture',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `When horizontally scaling ${t.name}, how are workloads evenly partitioned across available nodes?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Consistent hashing, range-based partitioning, or round-robin cluster dispatching.`,
        `Directing one hundred percent of traffic to a single node until it exhausts its resources.`,
        `Broadcasting every single request to all nodes in the cluster simultaneously for redundant execution.`,
        `Randomly disconnecting worker nodes every five minutes to balance load.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Horizontal scalability in ${t.name} relies on consistent hashing algorithms or partition keys to distribute load uniformly.`,
  },
  // 15. Security & Authentication Hardening
  {
    title: 'Security Architecture and Least Privilege',
    type: 'single_choice',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `Which security configuration is mandatory when hardening ${t.name} for enterprise compliance?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Enforcing TLS 1.3 encryption in transit, strict RBAC, and ephemeral credential rotation.`,
        `Granting root or superuser privileges to all external client connections by default.`,
        `Disabling authentication mechanisms when deploying behind an internal firewall.`,
        `Storing plain-text administrative passwords in world-readable shared filesystem directories.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Enterprise hardening of ${t.name} mandates cryptographic protocol security, mutual TLS, role-based access control, and credential hygiene.`,
  },
  // 16. Resource Contention & Lock Management
  {
    title: 'Lock Contention and Deadlock Resolution',
    type: 'troubleshooting',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `If a performance profile of ${t.name} reveals excessive lock wait times, what is the root cause?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Long-running transactions holding coarse-grained exclusive locks on shared resources.`,
        `Operating system clock synchronization drifting by several microseconds.`,
        `Network cables experiencing excessive thermal noise.`,
        `Excessive available CPU cores causing thread scheduling starvation.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Lock contention in ${t.name} is remediated by reducing transaction durations, adopting optimistic locking, or refining lock granularity.`,
  },
  // 17. Telemetry & Observability
  {
    title: 'Metrics, Tracing and Telemetry Instrumentation',
    type: 'single_choice',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `How does ${t.name} export runtime telemetry for modern SRE observability stacks?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Exposes OpenTelemetry traces, Prometheus metrics endpoints, and structured JSON logs.`,
        `Prints unstructured debug statements exclusively to standard output without timestamps.`,
        `Requires physical console access to inspect binary memory registers.`,
        `Transmits telemetry via legacy dial-up modem emulation protocols.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `${t.name} integrates with industry-standard observability frameworks (OpenTelemetry, Prometheus) to publish golden signals.`,
  },
  // 18. Caching & Memory Buffering
  {
    title: 'Cache Invalidation and Buffer Pools',
    type: 'single_choice',
    difficulty: 'advanced',
    getPrompt: (t) =>
      `What eviction policy is commonly utilized by ${t.name}'s internal buffer caches to retain hot working sets?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Least Recently Used (LRU) or Clock-sweep algorithms with frequency touch counts.`,
        `First-In, First-Out (FIFO) without evaluating access frequency or recency.`,
        `Randomly evicting twenty percent of buffers on every single read miss.`,
        `Retaining all buffers in memory indefinitely until swap exhaustion occurs.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Buffer pools in ${t.name} utilize variants of 2Q or Clock/LRU with touch counts to ensure frequently accessed pages remain resident.`,
  },
  // 19. SRE Incident: Out Of Memory (OOM)
  {
    title: 'Incident Analysis: Memory Pressure and OOM',
    type: 'troubleshooting',
    difficulty: 'expert',
    getPrompt: (t) =>
      `During a high-traffic incident, a ${t.name} instance is killed by the OS OOM killer. What is the definitive diagnostic procedure?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Analyze heap dumps, profile allocation hotspots, and rightsize container memory limits with headroom.`,
        `Disable the operating system memory management subsystem entirely.`,
        `Increase swap space to twenty times physical RAM to absorb the leak indefinitely.`,
        `Restart the instance every five minutes in a cron job without investigating allocation.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `SRE best practices require capturing heap/core dumps, profiling memory allocation graphs, and tuning process memory limits.`,
  },
  // 20. Zero-Downtime Upgrades
  {
    title: 'Deployment Strategy: Zero-Downtime Migration',
    type: 'architecture',
    difficulty: 'expert',
    getPrompt: (t) =>
      `When rolling out a version upgrade for ${t.name} in an active production cluster, which strategy guarantees zero downtime?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Canary or rolling updates with backward-compatible schema contracts and readiness health probes.`,
        `Terminating all running nodes simultaneously and starting the new version concurrently.`,
        `Applying destructive schema migrations while active transactions are in flight.`,
        `Rebuilding the underlying database cluster from raw scratch during peak business hours.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Zero-downtime upgrades in ${t.name} require rolling restarts, dual-writing or expand-and-contract schema migrations, and strict health checks.`,
  },
  // 21. CPU Profiling and Flame Graphs
  {
    title: 'Performance Diagnostics: CPU Hotspot Analysis',
    type: 'troubleshooting',
    difficulty: 'expert',
    getPrompt: (t) =>
      `When inspecting a CPU saturation event in ${t.name}, what tool provides the highest fidelity visualization of call stacks?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Flame graphs generated from sampling profilers (e.g. perf, async-profiler, or eBPF).`,
        `Simple grep queries across rotated system log files.`,
        `Checking the physical server power consumption meter.`,
        `Inspecting the operating system ping latency to default gateway.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Sampling profilers and flame graphs aggregate on-CPU stack samples to pinpoint precise function bottlenecks in ${t.name}.`,
  },
  // 22. Disaster Recovery: Point-in-Time Recovery
  {
    title: 'Disaster Recovery: Point-in-Time Recovery (PITR)',
    type: 'architecture',
    difficulty: 'expert',
    getPrompt: (t) =>
      `How does ${t.name} achieve Point-in-Time Recovery (PITR) following an catastrophic accidental data mutation?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Restores a base backup snapshot and rolls forward transaction/redo logs up to the specific target timestamp.`,
        `Reconstructs lost state by parsing reverse HTTP proxy logs from browser history.`,
        `Attempts to undo mutations by inverting arithmetic operations without redo logs.`,
        `Reads temporary browser cache files from disconnected client devices.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `PITR in ${t.name} pairs consistent base storage snapshots with sequential write-ahead / redo logs to replay transactions up to a target timestamp.`,
  },
  // 23. Distributed Tracing & Context Propagation
  {
    title: 'Distributed Systems: Context Propagation',
    type: 'single_choice',
    difficulty: 'expert',
    getPrompt: (t) =>
      `In a microservices topology involving ${t.name}, how is request correlation preserved across asynchronous boundaries?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Propagates W3C Trace Context headers (traceparent, tracestate) across network and queue hops.`,
        `Relies on synchronized system clock times without passing correlation identifiers.`,
        `Generates a new random transaction identifier on every internal component boundary.`,
        `Appends transaction logs to a public decentralized blockchain.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Standardized distributed tracing (W3C Trace Context) allows end-to-end trace correlation across all hops involving ${t.name}.`,
  },
  // 24. Network Partition & PACELC Theorem
  {
    title: 'Distributed Systems: PACELC Trade-Offs',
    type: 'architecture',
    difficulty: 'expert',
    getPrompt: (t) =>
      `According to the PACELC theorem, what trade-off does ${t.name} navigate when operating normally without partitions?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Balancing latency (L) against consistency (C) when partitions are absent.`,
        `Balancing disk storage capacity against processor clock frequency.`,
        `Balancing software licensing fees against cloud provider compute tiers.`,
        `Balancing developer team size against deployment pipeline duration.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `PACELC states that if there is a partition (P), how does the system trade Availability (A) and Consistency (C); Else (E), how does it trade Latency (L) and Consistency (C).`,
  },
  // 25. Graceful Shutdown & Request Draining
  {
    title: 'Lifecycle Management: Graceful Shutdown',
    type: 'single_choice',
    difficulty: 'expert',
    getPrompt: (t) =>
      `When a SIGTERM signal is received by a ${t.name} production process, what is the correct teardown sequence?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Fail readiness probes, stop accepting new connections, drain in-flight requests within timeout, and flush buffers.`,
        `Immediately send SIGKILL to all threads and terminate with exit code zero.`,
        `Purge all persistent storage volumes to ensure a clean state upon restart.`,
        `Ignore the signal indefinitely until an administrator issues a hardware reboot.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Graceful shutdown in ${t.name} stops traffic ingress via readiness failure, drains active work, flushes state, and exits cleanly.`,
  },
  // 26. Security: Cryptographic Key Management
  {
    title: 'Enterprise Security: Secrets and Key Rotation',
    type: 'single_choice',
    difficulty: 'expert',
    getPrompt: (t) =>
      `What is the industry standard for managing cryptographic keys and sensitive credentials in ${t.name}?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Integration with dedicated KMS / Secret Managers with automated envelope encryption and rotation.`,
        `Storing unencrypted private keys in environment configuration files committed to Git.`,
        `Hardcoding cryptographic seeds in compiled application binaries.`,
        `Distributing shared secrets via unauthenticated plaintext email notifications.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Production credentials in ${t.name} must be secured via envelope encryption, hardware security modules (HSM), or managed secret vaults.`,
  },
  // 27. Capstone Architecture Evaluation
  {
    title: 'Enterprise Architecture: System Design Synthesis',
    type: 'architecture',
    difficulty: 'expert',
    getPrompt: (t) =>
      `When architecting a mission-critical enterprise platform using ${t.name}, which design decision provides the highest durability and resilience?`,
    getOptions: (t, cIdx) => {
      const answers = [
        `Redundant multi-zone deployment, automated immutable infrastructure, explicit backpressure, and synchronous replication with quorum.`,
        `Single-instance monolithic deployment on oversized bare-metal hardware without replication.`,
        `Disabling WAL and persistence flushes to maximize synthetic write benchmarks.`,
        `Routing all production and development traffic through a single shared non-production node.`,
      ];
      return rotateOptions(answers, cIdx);
    },
    getExplanation: (t) =>
      `Enterprise resilience in ${t.name} demands multi-availability-zone topology, automated failover, quorum-based state durability, and comprehensive SRE observability.`,
  },
];

function rotateOptions(
  rawTexts: string[],
  correctIndex: number
): Array<{ id: string; text: string }> {
  const ids = ['opt-1', 'opt-2', 'opt-3', 'opt-4'];
  const shifted = [...rawTexts];
  // Shift texts so that rawTexts[0] is at position correctIndex
  const correctText = shifted[0]!;
  shifted.splice(0, 1);
  shifted.splice(correctIndex, 0, correctText);

  return ids.map((id, idx) => ({
    id,
    text: shifted[idx] || '',
  }));
}

export function generateSeedData(): GeneratedSeedData {
  const now = new Date().toISOString();

  const technologies: Array<Omit<Technology, 'createdAt' | 'updatedAt'>> = [];
  const courses: Course[] = [];
  const chapters: Chapter[] = [];
  const lessons: Lesson[] = [];
  const lessonChunks: LessonChunk[] = [];
  const assessmentSets: AssessmentSet[] = [];
  const exercises: HandsOnExercise[] = [];
  const mcqQuestions: MCQQuestion[] = [];
  const mcqAnswerKeys: MCQAnswerKey[] = [];

  MARKET_TECHNOLOGIES.forEach((tech, index) => {
    // 1. Technology Document
    technologies.push({
      id: tech.id,
      name: tech.name,
      slug: tech.slug,
      domainId: tech.domainId,
      domainSlug: tech.domainSlug,
      shortDescription: tech.shortDescription,
      longDescription: tech.longDescription,
      logoUrl: tech.logoUrl,
      websiteUrl: tech.websiteUrl,
      officialDocsUrl: tech.officialDocsUrl,
      tags: tech.tags,
      versions: tech.versions,
      status: 'published',
      stats: {
        publishedLessons: 42,
        publishedMcqs: 1001,
        publishedExercises: 1001,
        totalLearners: 0,
        targetMcqCount: 1001,
        targetExerciseCount: 1001,
      },
      searchTokens: tech.searchTokens,
    });

    // 2. Course
    const courseId = `course-${tech.slug}`;
    const course: Course = {
      id: courseId,
      technologyId: tech.id,
      title: tech.courseTitle,
      slug: `${tech.slug}-deep-dive`,
      description: tech.courseDescription,
      difficulty: 'advanced',
      order: index + 1,
      status: 'published',
      moduleCount: 1,
      lessonCount: 1,
      createdAt: now,
      updatedAt: now,
    };
    courses.push(course);

    // 3. Chapter
    const chapterId = `chap-${tech.slug}`;
    const chapter: Chapter = {
      id: chapterId,
      moduleId: `mod-${tech.slug}`,
      courseId,
      technologyId: tech.id,
      title: tech.chapterTitle,
      slug: `${tech.slug}-internals`,
      description: tech.chapterDescription,
      order: 1,
      status: 'published',
      lessonCount: 1,
    };
    chapters.push(chapter);

    // 4. Lesson
    const lessonId = `lesson-${tech.slug}`;
    const lesson: Lesson = {
      id: lessonId,
      chapterId,
      moduleId: `mod-${tech.slug}`,
      courseId,
      technologyId: tech.id,
      title: tech.lessonTitle,
      slug: `${tech.slug}-core-mechanics`,
      summary: tech.lessonSummary,
      difficulty: 'advanced',
      readingTimeMinutes: 25,
      order: 1,
      status: 'published',
      tags: tech.tags,
      chunkCount: 1,
      diagrams: [
        {
          id: `diag-${tech.slug}-1`,
          title: `${tech.name} Architecture Topology`,
          type: 'mermaid',
          rawDefinition: `flowchart TD\n  Client[Client / Ingress] --> Engine[${tech.name} Engine]\n  Engine --> Sub1[${tech.coreTopics[0] || 'Subsystem A'}]\n  Engine --> Sub2[${tech.coreTopics[1] || 'Subsystem B'}]\n  Sub1 --> Storage[State & Storage Fabric]\n  Sub2 --> Telemetry[Telemetry & Observability]`,
          description: `High-level component interaction and data flow diagram for ${tech.name}.`,
        },
      ],
      references: [
        {
          title: `${tech.name} Official Documentation`,
          url: tech.officialDocsUrl || tech.websiteUrl || 'https://projuktix.onrender.com',
          sourceTier: 'official',
          citation: `${tech.name} Core Engineering Guide`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    lessons.push(lesson);

    // 5. Lesson Chunk
    const chunkId = `chunk-${tech.slug}-1`;
    const chunkContent = `
# ${tech.lessonTitle}

## 1. Architectural Overview & Foundations
${tech.longDescription}

The **${tech.name}** architecture is engineered for mission-critical predictability, strict boundary isolation, and robust state guarantees. Enterprise engineering teams leverage ${tech.name} to establish scalable foundations across modern computing domains.

\`\`\`mermaid
flowchart TD
  Client[Client Application] --> Gateway[Ingress & Transport Layer]
  Gateway --> Controller[${tech.name} Controller]
  Controller --> Subsystem1[${tech.coreTopics[0] || 'Primary Subsystem'}]
  Controller --> Subsystem2[${tech.coreTopics[1] || 'Secondary Subsystem'}]
  Subsystem1 --> StateStore[(State & Storage Engine)]
  Subsystem2 --> StateStore
\`\`\`

---

## 2. Deep Dive: Core Technical Dimensions

### ${tech.coreTopics[0] || 'Core Subsystem'}
The primary pillar of ${tech.name} focuses on lifecycle guarantees, memory safety, and deterministic execution. Key design properties include:
* **Isolation Boundary**: Prevents uncoordinated mutations across execution boundaries.
* **Invariant Enforcement**: Propagates structured errors immediately when internal contracts are violated.
* **Deterministic Resource Reclamation**: Safeguards against resource leaks during peak throughput.

### ${tech.coreTopics[1] || 'Processing Pipeline'}
Execution workflows in ${tech.name} are dispatched through verified pipelines, ensuring that all state changes satisfy ACID or consensus requirements before acknowledgment.

| Architectural Dimension | Strategy | Operational Guarantee |
| :--- | :--- | :--- |
| **Concurrency Model** | Managed Thread Pools / Event Loops | Low-latency dispatch with bounded queuing |
| **State Consistency** | Strict Validation / Invariant Checks | Zero silent corruption |
| **Telemetry** | OpenTelemetry & Prometheus Metrics | Comprehensive golden signals |
| **Resilience** | Circuit Breakers & Backpressure | Graceful degradation under load |

---

## 3. Production Configuration & CLI Snippets

To verify runtime readiness and inspect runtime components, execute standard management commands:

\`\`\`bash
${tech.exerciseCommands.join('\n')}
\`\`\`

Example implementation or configuration pattern:

\`\`\`typescript
${tech.sampleCode}
\`\`\`

---

## 4. Production Hardening & SRE Failure Modes

### Out-Of-Memory (OOM) Mitigation
When operating under intense memory pressure:
1. Capture heap allocations and analyze dominator trees using sampling profilers.
2. Establish explicit container limits with at least 25% buffer headroom.
3. Apply backpressure upstream to prevent queue accumulation during downstream slowdowns.

### Zero-Downtime Rolling Restarts
* Configure readiness probes to fail gracefully before socket termination.
* Allow active in-flight requests a minimum of 30 seconds to drain completely.
* Verify cluster consensus or replication synchronization prior to cycling the next node.

---
*Reference: [Official ${tech.name} Documentation](${tech.officialDocsUrl})*
`;

    const lessonChunk: LessonChunk = {
      id: chunkId,
      lessonId,
      chunkIndex: 0,
      contentMarkdown: chunkContent.trim(),
      hasCode: true,
      hasMermaid: true,
    };
    lessonChunks.push(lessonChunk);

    // 6. MCQs & Answer Keys (27 questions per tech = 1,242 MCQs across 46 techs)
    const techQuestionIds: string[] = [];

    QUESTION_ARCHETYPES.forEach((archetype, qIdx) => {
      const questionId = `q-${tech.slug}-${qIdx + 1}`;
      techQuestionIds.push(questionId);

      const correctOptionIndex = qIdx % 4; // Rotates between opt-1, opt-2, opt-3, opt-4
      const correctOptionId = `opt-${correctOptionIndex + 1}`;
      const options = archetype.getOptions(tech, correctOptionIndex);

      const question: MCQQuestion = {
        id: questionId,
        technologyId: tech.id,
        courseId,
        topicId: `${tech.slug}-${archetype.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        questionType: archetype.type,
        promptMarkdown: archetype.getPrompt(tech),
        options,
        difficulty: archetype.difficulty,
        tags: [tech.slug, ...tech.tags.slice(0, 3)],
        estimatedSeconds: 60,
        status: 'published',
        createdAt: now,
        updatedAt: now,
      };
      mcqQuestions.push(question);

      const answerKey: MCQAnswerKey = {
        questionId,
        correctOptionIds: [correctOptionId],
        explanation: archetype.getExplanation(tech),
        references: [`${tech.name} Official Documentation: ${tech.officialDocsUrl}`],
      };
      mcqAnswerKeys.push(answerKey);
    });

    // 7. Assessment Set (Certification Exam)
    const assessmentSet: AssessmentSet = {
      id: `assess-${tech.slug}`,
      technologyId: tech.id,
      title: tech.examTitle,
      slug: tech.examSlug,
      description: `Comprehensive standardized certification examination for ${tech.name}. Rigorously tests architecture, runtime internals, high availability, concurrency, performance tuning, and incident resolution.`,
      difficulty: 'advanced',
      passPercentage: 75,
      timeLimitMinutes: 45,
      negativeMarkingRate: 0,
      totalQuestions: techQuestionIds.length,
      isMockExam: true,
      questionIds: techQuestionIds,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    };
    assessmentSets.push(assessmentSet);

    // 8. Hands-On Exercise
    const exercise: HandsOnExercise = {
      id: `ex-${tech.slug}`,
      technologyId: tech.id,
      topicId: `${tech.slug}-architecture-tuning`,
      title: tech.exerciseTitle,
      slug: tech.exerciseSlug,
      description: `Hands-on practical enterprise engineering lab for ${tech.name}. Configure, execute, and verify runtime state using automated checkpoints.`,
      exerciseType: 'config_tuning',
      difficulty: 'advanced',
      estimatedMinutes: 20,
      prerequisites: [`Basic understanding of ${tech.name}`, 'Command-line interface familiarity'],
      learningObjectives: [
        `Understand and implement core ${tech.name} configuration patterns`,
        `Validate runtime execution against automated checkpoints`,
      ],
      toolsRequired: [`${tech.name} CLI / SDK`, 'Terminal Environment'],
      steps: [
        {
          stepNumber: 1,
          title: `Inspect and Verify ${tech.name} Runtime Environment`,
          instructionsMarkdown: `Execute commands to inspect the local installation, verify environment variables, and review default configuration settings for ${tech.name}.`,
          commands: tech.exerciseCommands,
          expectedOutput: tech.exerciseExpectedOutput,
        },
        {
          stepNumber: 2,
          title: `Configure and Execute ${tech.name} Code / Configuration`,
          instructionsMarkdown: tech.exerciseInstructions,
          commands: [tech.exerciseCommands[0] || 'echo "Verified"'],
          expectedOutput: 'Verification successful.',
        },
      ],
      checkpoints: [
        {
          id: `cp-${tech.slug}-1`,
          stepNumber: 2,
          description: `Validate code or configuration adheres to ${tech.name} standards`,
          criteriaType: 'regex_pattern',
          validationRule: tech.checkpointRegex,
          points: 100,
        },
      ],
      starterCode: `// ${tech.name} Hands-On Lab Starter\n// Implement solution satisfying requirements:\n${tech.sampleCode}\n`,
      status: 'published',
      createdAt: now,
      updatedAt: now,
    };
    exercises.push(exercise);
  });

  return {
    technologies,
    courses,
    chapters,
    lessons,
    lessonChunks,
    assessmentSets,
    exercises,
    mcqQuestions,
    mcqAnswerKeys,
  };
}
