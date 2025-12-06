import { adminDB as db } from '../server/firebase/admin.mjs';

async function fixUserIds() {
  const snapshot = await db.collection('gallery').get();

  const updates = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.userId === 'guest') {
      updates.push(
        db.collection('gallery').doc(doc.id).update({
          userId: "juanamisano@gmail.com"
        })
      );
    }
  });

  await Promise.all(updates);
  console.log("Updated all guest images to the correct userId");
}

fixUserIds().catch(console.error);
