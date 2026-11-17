import { db } from '../config/firebase.js';
import { INITIAL_DOMAINS } from '@projuktix/shared';
import { generateSeedData } from './seed-data/generator.js';

async function commitInBatches<T>(
  collectionName: string,
  items: T[],
  getId: (item: T) => string,
  batchSize = 400
): Promise<void> {
  console.log(`📦 Writing ${items.length} documents to '${collectionName}'...`);
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const batch = db.batch();
    for (const item of chunk) {
      const docRef = db.collection(collectionName).doc(getId(item));
      batch.set(docRef, item as FirebaseFirestore.WithFieldValue<FirebaseFirestore.DocumentData>);
    }
    await batch.commit();
    console.log(
      `   └─ Committed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)} (${chunk.length} docs)`
    );
  }
}

export async function runDatabaseSeed(): Promise<void> {
  console.log('🌱 [ProjuktiX Seed] Beginning authoritative enterprise database seeding...');

  // 1. Seed Domains (All 24 Domains)
  console.log(`📂 Seeding ${INITIAL_DOMAINS.length} domain categories...`);
  const domainBatch = db.batch();
  for (const domain of INITIAL_DOMAINS) {
    const docRef = db.collection('domains').doc(domain.id);
    domainBatch.set(docRef, {
      ...domain,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  await domainBatch.commit();
  console.log('✅ Domains seeded successfully.');

  // 2. Generate Seed Data (46 Market Technologies, Courses, Lessons, Chunks, Labs, Exams, 1,200+ MCQs)
  console.log('⚙️ Generating market technology curriculum, labs, exams, and MCQ bank...');
  const data = generateSeedData();
  console.log(`📊 Generated:
     - ${data.technologies.length} Market Technologies
     - ${data.courses.length} Deep-Dive Courses
     - ${data.chapters.length} Technical Chapters
     - ${data.lessons.length} In-Depth Lessons
     - ${data.lessonChunks.length} Lesson Chunks with Mermaid Architecture
     - ${data.assessmentSets.length} Standardized Certification Mock Exams
     - ${data.exercises.length} Hands-On Engineering Labs
     - ${data.mcqQuestions.length} Practice MCQs (>1000 Total)
     - ${data.mcqAnswerKeys.length} Protected Answer Keys`);

  // 3. Batch Writes
  await commitInBatches('technologies', data.technologies, (t) => t.id);
  await commitInBatches('courses', data.courses, (c) => c.id);
  await commitInBatches('chapters', data.chapters, (ch) => ch.id);
  await commitInBatches('lessons', data.lessons, (l) => l.id);
  await commitInBatches('lessonChunks', data.lessonChunks, (lc) => lc.id);
  await commitInBatches('assessmentSets', data.assessmentSets, (a) => a.id);
  await commitInBatches('handsOnExercises', data.exercises, (e) => e.id);
  await commitInBatches('mcqQuestions', data.mcqQuestions, (q) => q.id);
  await commitInBatches('mcqAnswerKeys', data.mcqAnswerKeys, (k) => k.questionId);

  console.log('🎉 [ProjuktiX Seed] Universal multi-technology database seeding completed successfully!');
}

// Execute if run directly from CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runDatabaseSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Database seed failed:', err);
      process.exit(1);
    });
}
