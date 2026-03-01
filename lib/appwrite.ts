import { CreateUserPrams, GetMenuParams, SignInParams } from "@/types";
import { Account, Avatars, Client, Databases, Functions, ID, Query, Storage } from 'react-native-appwrite';

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: "host.exp.exponent",
 
  databaseId:'68a44cc6001c11908d47',
  
  bucketId:'68a4578c0015ee41cdac',
  bucketAvaterId:'68b40451001fb2ece0da',
  userCollectionId:'68a44ce600237b07694e',
  categoriesCollectionId:'68a44dd90020e23ac66e',
  menuCollectionId:'68a44dc6002fe6b5536a',
  customizationsCollectionId:'68a44e28003789f1606c',
  menuCustomizationsCollectionId:'68a44e18000bf042d32e',
  addressesCollectionId:'68b4e1f2001a3c45d678',
  ordersCollectionId:'68ae79bf0014731b8b31',
  orderItemsCollectionId:'order_items',
  orderItemCustomizationsCollectionId:'order_item_customizations',

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
export const functions = new Functions(client);

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

// Address Management Functions
export const getAddresses = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.addressesCollectionId,
      [
        Query.equal('userId', userId),
        Query.orderDesc('isDefault'), // Default addresses first
        Query.orderDesc('$createdAt')
      ]
    );

    return {
      success: true,
      addresses: response.documents
    };
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch addresses'
    };
  }
};

export const createAddress = async ({
  userId,
  title,
  address,
  city,
  postalCode,
  country,
  isDefault
}: {
  userId: string;
  title: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}) => {
  try {
    // If this is being set as default, update other addresses to not be default
    if (isDefault) {
      const existingAddresses = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.addressesCollectionId,
        [
          Query.equal('userId', userId),
          Query.equal('isDefault', true)
        ]
      );

      // Update existing default addresses
      for (const addr of existingAddresses.documents) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.addressesCollectionId,
          addr.$id,
          { isDefault: false }
        );
      }
    }

    const newAddress = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.addressesCollectionId,
      ID.unique(),
      {
        userId, // This will create relationship to User table
        title,
        address,
        city,
        postalCode: postalCode || '',
        country,
        isDefault: isDefault || false
      }
    );

    return {
      success: true,
      address: newAddress
    };
  } catch (error) {
    console.error('Error creating address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create address'
    };
  }
};

export const updateAddress = async ({
  addressId,
  title,
  address,
  city,
  postalCode,
  country,
  isDefault
}: {
  addressId: string;
  title: string;
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  isDefault?: boolean;
}) => {
  try {
    // If this is being set as default, first get the current address to find the userId
    if (isDefault) {
      const currentAddress = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.addressesCollectionId,
        addressId
      );

      // Update other addresses of the same user to not be default
      const existingAddresses = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.addressesCollectionId,
        [
          Query.equal('userId', currentAddress.userId),
          Query.equal('isDefault', true),
          Query.notEqual('$id', addressId)
        ]
      );

      // Update existing default addresses
      for (const addr of existingAddresses.documents) {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.addressesCollectionId,
          addr.$id,
          { isDefault: false }
        );
      }
    }

    const updatedAddress = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.addressesCollectionId,
      addressId,
      {
        title,
        address,
        city,
        postalCode: postalCode || '',
        country,
        isDefault: isDefault || false
      }
    );

    return {
      success: true,
      address: updatedAddress
    };
  } catch (error) {
    console.error('Error updating address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update address'
    };
  }
};

export const deleteAddress = async (addressId: string) => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.addressesCollectionId,
      addressId
    );

    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting address:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete address'
    };
  }
};

// User profile management function
export const updateUserProfile = async ({ 
  userId, 
  name, 
  email, 
  phone 
}: { 
  userId: string; 
  name: string; 
  email: string; 
  phone?: string; 
}) => {
  try {
    // Update user document
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        name,
        email,
        phone: phone || null, // Set to null if phone number is not provided
      }
    );

    return {
      success: true,
      user: updatedUser
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user profile'
    };
  }
};

// Avatar upload function
export const uploadAvatar = async (imageUri: string, userId: string) => {
  try {
    // First get user's current avatar to delete old file later
    let oldAvatarFileId = null;
    try {
      const currentUser = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      );
      
      // Extract file ID from avatar URL (if exists)
      if (currentUser.avatar && typeof currentUser.avatar === 'string') {
        // Extract file ID from URL
        // URL format: {endpoint}/storage/buckets/{bucketId}/files/{fileId}/view?project={projectId}
        const fileIdMatch = currentUser.avatar.match(/\/files\/([^\/]+)\/view/);
        if (fileIdMatch && fileIdMatch[1]) {
          oldAvatarFileId = fileIdMatch[1];
        }
      }
    } catch (error) {
      console.log('Could not get current user avatar for cleanup:', error);
    }

    // Create unique filename for the file
    const fileName = `avatar_${userId}_${Date.now()}.jpg`;
    
    // File object format required by React Native Appwrite
    const fileToUpload = {
      name: fileName,
      type: 'image/jpeg',
      size: 0, // Size will be calculated automatically by Appwrite
      uri: imageUri
    };

    // Upload file to Appwrite Storage
    const uploadedFile = await storage.createFile(
      appwriteConfig.bucketAvaterId,
      ID.unique(),
      fileToUpload
    );

    // Manually construct file access URL
    const avatarUrl = `${appwriteConfig.endpoint}/storage/buckets/${appwriteConfig.bucketAvaterId}/files/${uploadedFile.$id}/view?project=${appwriteConfig.projectId}`;

    // Update avatar field in user document
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        avatar: avatarUrl
      }
    );

    // Delete old avatar file (if exists)
    if (oldAvatarFileId) {
      try {
        await storage.deleteFile(appwriteConfig.bucketAvaterId, oldAvatarFileId);
        console.log('Old avatar file deleted successfully');
      } catch (error) {
        console.log('Could not delete old avatar file:', error);
        // Don't throw error because new avatar has been successfully uploaded
      }
    }

    return {
      success: true,
      avatarUrl: avatarUrl,
      fileId: uploadedFile.$id
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload avatar'
    };
  }
};

const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD${timestamp}${random}`;
};


export const createOrder = async (orderData: {
  userId: string;
  items: any[];
  totalAmount: number;
  deliveryAddressId?: string;
}) => {
  try {
    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Step 1: Create the main order document
    const order = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      ID.unique(),
      {
        order_number: orderNumber,
        user_id: orderData.userId, // This is a relationship field
        delivery_address_id: orderData.deliveryAddressId || null, // This is a relationship field
        total_amount: orderData.totalAmount,
        status: 'pending',
        payment_status: 'unpaid', // Changed from 'pending' to 'unpaid'
      }
    );

    // Step 2: Create order items for each item in the cart
    const orderItemsPromises = orderData.items.map(async (item) => {
      const orderItem = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.orderItemsCollectionId,
        ID.unique(),
        {
          order_id: order.$id, // Relationship to orders collection
          menu_item_id: item.menuItemId || null, // Relationship to menu_items collection
          item_name: item.name,
          item_price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        }
      );

      // Step 3: Create customizations for this order item (if any)
      if (item.customizations && item.customizations.length > 0) {
        const customizationsPromises = item.customizations.map((customization: any) =>
          databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.orderItemCustomizationsCollectionId,
            ID.unique(),
            {
              order_item_id: orderItem.$id, // Relationship to order_items collection
              customization_id: customization.id || null, // Relationship to customizations collection
              customization_name: customization.name,
              customization_price: customization.price,
              customization_type: customization.type,
              quantity: customization.quantity || 1, // Required field
            }
          )
        );
        
        await Promise.all(customizationsPromises);
      }

      return orderItem;
    });

    await Promise.all(orderItemsPromises);

    return {
      success: true,
      order,
      orderNumber
    };

  } catch (error) {
    console.error('Create order error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    };
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: string, 
  paymentStatus?: string,
  paymentIntentId?: string
) => {
  try {
    const updateData: any = {
      status
    };

    if (paymentStatus) {
      updateData.payment_status = paymentStatus; // Use snake_case
    }

    if (paymentIntentId) {
      updateData.payment_intent_id = paymentIntentId; // Use snake_case
    }

    const order = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      orderId,
      updateData
    );

    return {
      success: true,
      order
    };

  } catch (error) {
    console.error('Update order status error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status'
    };
  }
};

export const getUserOrders = async (userId: string, cursor?: string) => {
  const PAGE_SIZE = 10;
  try {
    const queries = [
      Query.equal('user_id', userId),
      Query.orderDesc('$createdAt'),
      Query.limit(PAGE_SIZE),
    ];

    if (cursor) {
      queries.push(Query.cursorAfter(cursor));
    }

    const orders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      queries
    );

    // Fetch order items for each order
    const ordersWithItems = await Promise.all(
      orders.documents.map(async (order) => {
        try {
          const orderItems = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.orderItemsCollectionId,
            [
              Query.equal('order_id', order.$id),
              Query.limit(100)
            ]
          );
          
          return {
            ...order,
            items: orderItems.documents
          };
        } catch (error) {
          console.error(`Failed to fetch items for order ${order.$id}:`, error);
          return {
            ...order,
            items: []
          };
        }
      })
    );

    return {
      success: true,
      orders: ordersWithItems,
      hasMore: orders.documents.length === PAGE_SIZE,
      lastId: orders.documents.length > 0
        ? orders.documents[orders.documents.length - 1].$id
        : undefined,
    };

  } catch (error) {
    console.error('Get user orders error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get orders'
    };
  }
};


export const getOrderById = async (orderId: string) => {
  try {
    // Get the order document
    const order = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      orderId
    );

    // Get order items
    const orderItems = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orderItemsCollectionId,
      [Query.equal('order_id', orderId)]
    );

    // Get customizations for each order item
    const itemsWithCustomizations = await Promise.all(
      orderItems.documents.map(async (item) => {
        const customizations = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.orderItemCustomizationsCollectionId,
          [Query.equal('order_item_id', item.$id)]
        );

        return {
          ...item,
          customizations: customizations.documents
        };
      })
    );

    return {
      success: true,
      order: {
        ...order,
        items: itemsWithCustomizations
      }
    };

  } catch (error) {
    console.error('Get order by ID error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get order'
    };
  }
};

export const getOrdersByStatus = async (status: string, limit: number = 20) => {
  try {
    const orders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.ordersCollectionId,
      [
        Query.equal('status', status),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]
    );

    // For each order, fetch its items and customizations
    const ordersWithItems = await Promise.all(
      orders.documents.map(async (order) => {
        const orderItems = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.orderItemsCollectionId,
          [Query.equal('order_id', order.$id)]
        );

        const itemsWithCustomizations = await Promise.all(
          orderItems.documents.map(async (item) => {
            const customizations = await databases.listDocuments(
              appwriteConfig.databaseId,
              appwriteConfig.orderItemCustomizationsCollectionId,
              [Query.equal('order_item_id', item.$id)]
            );

            return {
              ...item,
              customizations: customizations.documents
            };
          })
        );

        return {
          ...order,
          items: itemsWithCustomizations
        };
      })
    );

    return {
      success: true,
      orders: ordersWithItems
    };

  } catch (error) {
    console.error('Get orders by status error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get orders by status'
    };
  }
};


// 创建支付意图（这个需要通过云函数调用Stripe API）
export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
try {
  // 这里应该调用云函数来创建 Stripe PaymentIntent
  // 暂时返回模拟数据
  const response = await functions.createExecution(
    'create-payment-intent', // 需要创建这个云函数
    JSON.stringify({ amount: amount * 100, currency }) // Stripe 使用分为单位
  );

  const result = JSON.parse(response.responseBody);
  
  return {
    success: true,
    clientSecret: result.clientSecret,
    paymentIntentId: result.id
  };

} catch (error) {
  console.error('Create payment intent error:', error);
  
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Failed to create payment intent'
  };
}
};


