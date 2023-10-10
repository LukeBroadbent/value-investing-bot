import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ChromaClient } from 'chromadb';
import { Chroma } from 'langchain/vectorstores/chroma';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';

const VectorStoreName = 'news-memory';

export default class NewsMemoryService {
  private static _instance: NewsMemoryService = new NewsMemoryService();
  private chroma = new ChromaClient({ path: 'http://localhost:8001' });

  constructor() {
    if (NewsMemoryService._instance) {
      throw new Error('Error: Instantiation failed: Use NewsMemoryService.getInstance() instead of new.');
    }

    NewsMemoryService._instance = this;
  }

  public static getInstance(): NewsMemoryService {
    return NewsMemoryService._instance;
  }

  async deleteCollection() {
    await this.chroma.deleteCollection({ name: VectorStoreName });
  }

  async addNewsStoriesToMemory(symbol: string): Promise<void> {
    var newsLocation = './company/' + symbol + '/news/';

    // Initialize the document loader with supported file formats
    const loader = new DirectoryLoader(newsLocation, {
      '.txt': (path) => new TextLoader(path),
    });

    const docs = await loader.loadAndSplit(new RecursiveCharacterTextSplitter());
    console.log(symbol + ' news gathered');

    // Create vector store and index the docs
    await Chroma.fromDocuments(docs, new OpenAIEmbeddings(), {
      collectionName: VectorStoreName,
      url: 'http://localhost:8001',
      collectionMetadata: {
        'hnsw:space': 'cosine',
      },
    });

    console.log('Finished adding ' + symbol + ' News stories to Memory');
  }

  async queryNewsMemory(prompt: string) {
    var nResults = 6;

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
