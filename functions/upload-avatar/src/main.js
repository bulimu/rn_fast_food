import { Client, Databases } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers['x-appwrite-key'] ?? '');

  const databases = new Databases(client);

  try {
    if (req.method !== 'POST') {
      return res.json({ error: 'Method not allowed', success: false }, 405);
    }

    const { userId, fileId } = JSON.parse(req.body || '{}');

    if (!userId || !fileId) {
      return res.json({
        error: 'Missing required parameters: userId and fileId',
        success: false
      }, 400);
    }

    const DATABASE_ID = process.env.DATABASE_ID;
    const USER_COLLECTION_ID = process.env.USER_COLLECTION_ID;
    const BUCKET_AVATAR_ID = process.env.BUCKET_AVATAR_ID;

    if (!DATABASE_ID || !USER_COLLECTION_ID || !BUCKET_AVATAR_ID) {
      return res.json({
        error: 'Function is not configured. Missing environment variables.',
        success: false
      }, 500);
    }

    const endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
    const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID;
    const fileUrl = `${endpoint}/storage/buckets/${BUCKET_AVATAR_ID}/files/${fileId}/view?project=${projectId}`;
    
    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      USER_COLLECTION_ID,
      userId,
      { avatar: fileUrl }
    );

    return res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        userId: userId,
        avatarUrl: fileUrl,
        user: updatedUser
      }
    });

  } catch (err) {
    error(`Avatar upload error: ${err.message}`);
    
    return res.json({
      success: false,
      error: err.message || 'Failed to update avatar'
    }, 500);
  }
};
