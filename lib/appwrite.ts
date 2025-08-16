import { CreateUserPrams, GetMenuParams, SignInParams } from "@/types";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: "host.exp.exponent",
  databaseId:'68695a47000c4b6c4654',
  
  bucketId:'686cefbe0006208f52ae',
  userCollectionId:'68695a76001d4519a1e1',
  categoriesCollectionId:'686ce9a70032f0c1aedd',
  menuCollectionId:'686cea6a002c093bad65',
  customizationsCollectionId:'686ced85000f018d7448',
  menuCustomizationsCollectionId:'686cee8f00153cde35de',

}

export const client = new Client()

client
 // @ts-ignore
  .setEndpoint(appwriteConfig.endpoint)
  // @ts-ignore
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);


export const account = new Account(client);
export const  databases= new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export const createUser = async ({ name, email, password }: CreateUserPrams) => {

  try {
    const newAccount = await account.create(ID.unique(), email, password, name);
    if(!newAccount) throw Error;

    await SignInSession({ email, password });

    const avatarUrl = avatars.getInitialsURL(name);

    return await databases.createDocument(
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
  } catch (error: any) {
    const msg = String(error?.message || error);
    if (msg.toLowerCase().includes('creation of session is prohibited') ||
        msg.toLowerCase().includes('session is active')) {
      try {
        await account.deleteSession('current');
      } catch (delErr) {
        console.warn('Failed to delete current session before signin retry:', delErr);
      }
      return await account.createEmailPasswordSession(email, password);
  }
   throw new Error(error as string);
}
}

export const getCurrentUser = async () => {
  try {
    const currentAccout = await account.get();
    if (!currentAccout) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccout.$id)]
    );

    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error:any) {
    // Handle specific error for missing scope or session expiration
     if (error?.message && error?.message.includes("missing scope")) {
      console.log("User not logged in or session expired");
      return null; 
    }
    console.error("Error fetching current user:", error);
    throw new Error(error as string);
  }
}

export const logoutUser = async () => {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error };
  }
}

export const getMenu = async ({category, query}:GetMenuParams) => {
  try {
    const queiries: string[] = [];

    if (category) {
      queiries.push(Query.equal('category', category));
    }
    if (query) {
      queiries.push(Query.search('name', query));
    }
    const menu = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queiries
    );

    return menu.documents;
  } catch(e:any) {
    console.error("Error fetching menu:", e);
    throw new Error(e as string);    
  }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}
