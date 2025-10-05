import sql from "../configs/db.js"

export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        
        // console.log('Getting creations for user:', userId);
        
        const creations = await sql`
            SELECT * FROM creations 
            WHERE user_id = ${userId} 
            ORDER BY creation_at DESC
        `;
        
        // console.log('Found creations:', creations.length);
                
        res.json({ success: true, creations });
    } catch (error) {
        // console.error('getUserCreations error:', error);
        res.json({ success: false, message: error.message });
    }
}

export const getPublishedCreations = async (req, res) => {
    try {
        // console.log('Getting published creations');
        
        const creations = await sql`
            SELECT * FROM creations 
            WHERE publish = true 
            ORDER BY creation_at DESC
        `;
        
        // console.log('Found published creations:', creations.length);
                
        res.json({ success: true, creations });
    } catch (error) {
        // console.error('getPublishedCreations error:', error);
        res.json({ success: false, message: error.message });
    }
}

export const toggleLikeCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        // console.log('Toggle like for user:', userId, 'creation:', id);

        if (!id) {
            return res.json({ success: false, message: "Creation ID is required" });
        }

        // Check if creation exists
        const creations = await sql`SELECT * FROM creations WHERE id = ${id}`;
        
        if (creations.length === 0) {
            return res.json({ success: false, message: "Creation not found." });
        }

        const creation = creations[0];
        
        // Get current likes array (handle null case)
        const currentLikes = creation.likes || [];
        const userIdStr = userId.toString();
        
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            // Unlike - remove user from likes array
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = 'Creation Unliked';
        } else {
            // Like - add user to likes array
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation Liked';
        }

        // Update the likes array in database
        await sql`
            UPDATE creations 
            SET likes = ${updatedLikes}
            WHERE id = ${id}
        `;
        
        // console.log('Updated likes for creation', id, ':', updatedLikes);
                
        res.json({ success: true, message });
    } catch (error) {
        // console.error('toggleLikeCreations error:', error);
        res.json({ success: false, message: error.message });
    }
}