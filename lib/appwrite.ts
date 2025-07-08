import { Account, Client, Databases,Storage, Avatars, ID, Query} from 'react-native-appwrite';
import { CreateUserPrams, GetMenuParams, SignInParams} from "@/types";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: "host.exp.exponent",
  databaseId:'68695a47000c4b6c4654',
  userCollectionId:'68695a76001d4519a1e1'
}

export const client = new Client()

client
  .setEndpoint(appwriteConfig.endpoint)
  // @ts-ignore
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);


export const account = new Account(client);
export const database = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export const createUser = async ({ name, email, password }: CreateUserPrams) => {

  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if(!newAccount) throw Error;

    await SignInSession({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { email, name, accountId: newAccount.$id, avatar: avatarUrl }
    );
    
  } catch (e) {
    throw new Error(e as string);
  }
}

export const SignInSession = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error as string);
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccout = await account.get();
    if (!currentAccout) throw Error;

    const currentUser = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccout.$id)]
    );

    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw new Error(error as string);
  }
}

