// Stores and Accesses Chat Interactions with Value-Investing-Bot
// Chroma DB - Local Vector Database
import fs from 'node:fs/promises';

// Document Loaders
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import path from 'path';

import { ChromaClient } from 'chromadb';
import { Document } from 'langchain/document';
import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const VectorStoreName = 'long-term-memory';

export default class LongTermMemoryService {
  private static _instance: LongTermMemoryService = new LongTermMemoryService();
  private chroma = new ChromaClient({ path: 'http://localhost:8001' });

  constructor() {
    if (LongTermMemoryService._instance) {
      throw new Error('Error: Instantiation failed: Use DatabaseService.getInstance() instead of new.');
    }

    LongTermMemoryService._instance = this;
  }

  public static getInstance(): LongTermMemoryService {
    return LongTermMemoryService._instance;
  }

  async deleteCollection() {
    await this.chroma.deleteCollection({ name: VectorStoreName });
  }

  async addDocumentsToLongTermMemory(): Promise<void> {
    // Create vector store and index the docs
    await Chroma.fromDocuments(await this.getAllDocuments(), new OpenAIEmbeddings(), {
      collectionName: VectorStoreName,
      url: 'http://localhost:8001',
      collectionMetadata: {
        'hnsw:space': 'cosine',
      },
    });

    console.log('Finished Adding Docs to Long Term Memory');
  }

  async queryLongTermMemory(prompt: string) {
    var nResults = 20;

    const vectorStore = await Chroma.fromExistingCollection(new OpenAIEmbeddings(), {
      collectionName: VectorStoreName,
      url: 'http://localhost:8001',
    });

    const documents = await vectorStore.similaritySearch(prompt, nResults);
    documents.forEach(doc => {
      console.log(JSON.stringify(doc))
    })
    return documents
      .map((doc) => doc.pageContent)
      .join(', ')
      .trim()
      .replaceAll('\n', ' ');
  }

  private async getAllDocuments() {
    var documentsLocation = './docs/';

    // Initialize the document loader with supported file formats
    const loader = new DirectoryLoader(documentsLocation, {
      '.json': (path) => new JSONLoader(path),
      '.txt': (path) => new TextLoader(path),
    });

    const docs = await loader.loadAndSplit(new RecursiveCharacterTextSplitter());
    console.log('Docs loaded.');

    return docs;
  }
}
