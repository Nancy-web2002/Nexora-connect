import fs from "node:fs";
import path from "node:path";
import { HMEM } from "../../vendor/hmem/src/index.ts";

const memoryRoot = path.resolve(process.cwd(), ".nexora-memory");
const instances = new Map<string, HMEM>();

function getMemory(userId: string): HMEM {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)
  ) {
    throw new Error("Invalid authenticated user ID");
  }

  let memory = instances.get(userId);

  if (!memory) {
    const userDir = path.join(memoryRoot, userId);
    fs.mkdirSync(userDir, { recursive: true });
    memory = new HMEM({ persistDir: userDir, actor: userId });
    instances.set(userId, memory);
  }

  return memory;
}

export function saveOpportunityPreference(
  userId: string,
  preference: string,
) {
  const content = preference.trim();

  if (!content || content.length > 500) {
    throw new Error("Preference must contain 1–500 characters");
  }

  const record = getMemory(userId).add({
    content,
    type: "preference",
    layer: "long_term",
    tags: ["opportunity", "user-preference"],
    confidence: 0.9,
    source: "user-explicit-preference",
    provenance: {
      origin: "manual",
      learnedAt: Date.now(),
      label: "Explicitly saved by the user",
    },
  });

  return {
    id: record.id,
    content: record.content,
    type: record.type,
    confidence: record.confidence,
    source: record.source,
    provenance: record.provenance,
  };
}

export function getOpportunityPreferences(
  userId: string,
  query = "opportunity preferences",
) {
  const result = getMemory(userId).query(query, {
    topN: 10,
    threshold: 0,
  });

  return {
    preferences: result.memories
      .filter(({ memory }) => memory.type === "preference")
      .map(({ memory, relevance }) => ({
        id: memory.id,
        content: memory.content,
        relevance: Number(relevance.toFixed(4)),
        source: memory.source,
        provenance: memory.provenance,
      })),
    trace: result.trace,
  };
}
