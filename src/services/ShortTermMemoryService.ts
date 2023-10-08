// Stores and Accesses Chat Interactions with Value-Investing-Bot
// Chroma DB - Local Vector Database

import { ChromaClient } from 'chromadb';
import { Document } from 'langchain/document';
import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const VectorStoreName = 'short-term-memory';

export default class ShortTermMemoryService {
  private static _instance: ShortTermMemoryService = new ShortTermMemoryService();
  private chroma = new ChromaClient({ path: 'http://localhost:8001' });

  constructor() {
    if (ShortTermMemoryService._instance) {
      throw new Error('Error: Instantiation failed: Use DatabaseService.getInstance() instead of new.');
    }

    ShortTermMemoryService._instance = this;
  }

  public static getInstance(): ShortTermMemoryService {
    return ShortTermMemoryService._instance;
  }

  async deleteCollection() {
    await this.chroma.deleteCollection({ name: VectorStoreName });
  }

  async addDocumentsToMemoryVectorStore(documents: Array<{ content: string; metadataType: string }>): Promise<void> {
    const formattedDocuments = documents.map(
      (doc) => new Document({ pageContent: doc.content, metadata: { type: doc.metadataType } })
    );

    // Create vector store and index the docs
    await Chroma.fromDocuments(formattedDocuments, new OpenAIEmbeddings(), {
      collectionName: VectorStoreName,
      url: 'http://localhost:8001',
      collectionMetadata: {
        'hnsw:space': 'cosine',
      },
    });
  }

  async queryShortTermMemory(prompt: string) {
    var nResults = 4;

    const vectorStore = await Chroma.fromExistingCollection(new OpenAIEmbeddings(), {
      collectionName: VectorStoreName,
      url: 'http://localhost:8001',
    });

    const documents = await vectorStore.similaritySearch(prompt, nResults);
    return documents
      .map((doc) => doc.pageContent)
      .join(', ')
      .trim()
      .replaceAll('\n', ' ');
  }
}
