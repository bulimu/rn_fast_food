import { CreateUserPrams, GetMenuParams, SignInParams } from "@/types";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: "host.exp.exponent",
 
  databaseId:'68a44cc6001c11908d47',
  
  bucketId:'68a4578c0015ee41cdac',
  userCollectionId:'68a44ce600237b07694e',
  categoriesCollectionId:'68a44dd90020e23ac66e',
  menuCollectionId:'68a44dc6002fe6b5536a',
  customizationsCollectionId:'68a44e28003789f1606c',
  menuCustomizationsCollectionId:'68a44e18000bf042d32e',

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
    //console.log("session", session)
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
      queiries.push(Query.equal('categories', category));
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
       // console.log("categories", categories.documents);
        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getProductDetail = async ({ productId }: { productId: string }) => {
  try {

    const [product, customizations] = await Promise.all([
      databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCollectionId,
        productId
      ),
      getProductCustomizations(productId)
    ]);

    // console.log("product categories", product.categories);
    return {
      ...product,
      customizations,
      deliveryInfo: {
        isFree: true,
        time: '20-30 mins',
        rating: product.rating || 4.5,
      },
      categories: product.categories.name || [],
      nutritionInfo: {
        calories: product.calories || 365,
        protein: product.protein || 35
      },
      tags: ['Whole Wheat'] 
    };
  } catch (error) {
    console.error('Error fetching product detail:', error);
    throw new Error(error as string);
  }
};

export const getProductCustomizations = async (productId: string) => {
  try {
    // get product customizations
    const menuCustomizations = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCustomizationsCollectionId,      
      [Query.equal('menu', productId)]
    );  

    const customizations = menuCustomizations.documents.map((menuCustom) => {
      const c = menuCustom.customizations;
      // Request smaller, optimized images for customization options
      const imageUrl = c.image_url
        ? `${c.image_url}?project=${appwriteConfig.projectId}&width=112&quality=85`
        : undefined;

      return {
        $id: c.$id,
        name: c.name,
        price: c.price,
        type: c.type,
        image_url: imageUrl,
      };
    });

    return customizations;
  } catch (error) {
    console.error('Error fetching customizations:', error);
    return [];
  }
};
