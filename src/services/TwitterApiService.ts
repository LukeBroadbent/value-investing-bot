export default class TwitterApiService {
  private static _instance: TwitterApiService = new TwitterApiService();

  constructor() {
    if (TwitterApiService._instance) {
      throw new Error('Error: Instantiation failed: Use DatabaseService.getInstance() instead of new.');
    }

    TwitterApiService._instance = this;
  }

  public static getInstance(): TwitterApiService {
    return TwitterApiService._instance;
  }
}
