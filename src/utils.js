import axios from "axios";
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "./firebaseApp"
// import imageCompression from "browser-image-compression";
//import { deleteImg } from "./cloudinaryUtils";
export const readUserData = async (setUser) => {
    const collectionref = collection(db, 'users')
    const docData = await getDoc(docref)
    setUser(docData.data())
}
/*
const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
const imgbburl = `https://api.imgbb.com/1/upload?key=${apiKey}`
console.log(imgbburl);

const uploadToIMGBB = async (file) => {
    const myFormData = new FormData()
    myFormData.append("image", file)
    try {
        const resonse = await axios.post(imgbburl, myFormData)
        const { url, delete_url } = resonse.data.data
        return { url, delete_url }
    } catch (error) {
        console.log("Képfeltöltési hiba: " + error);

    }
}

export const addRecipe = async (recipe, file) => {

    try {
        let imgUrl = ""
        let deleteUrl = ""
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true })
        const result = await uploadToIMGBB(file)
        if (result) {
            imgUrl = result.url
            deleteUrl = result.delete_url
            console.log(result);

            const collectionref = collection(db, "recipes")
            await addDoc(collectionref, { ...recipe, imgUrl, deleteUrl, timestamp: serverTimestamp() })
        }
    } catch (error) {
        console.log("Nem sikerült hozzáadni!" + error);

    }
}
//receptek realtime olvasása: onsnapshot()
export const readRecipes = async (setRecipes, setLoading) => {
    const collectionref = collection(db, "recipes")
    const q = query(collectionref, orderBy("timestamp", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setRecipes(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })))
        setLoading(false)
    })
    return unsubscribe
}
//recept törlése id alapján:
export const deleteRecipe = async (id, deleteUrl) => {
    //await axios.get(deleteUrl)
    const docref = doc(db, "recipes", id)
    await deleteDoc(docref)
}
export const readRecipe = async (id, setRecipe) => {
    const docref = doc(db, 'recipes', id)
    const docData = await getDoc(docref)
    setRecipe(docData.data())
}
//update
export const updateRecipe = async (id, updatedData, file) => {
    let imgUrl = updatedData.imgUrl || ''
    let deleteUrl = updatedData.deleteUrl || ''
    try {
        if (file) {
            //az új file eltárolása
            const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 800, useWebWorker: true })
            const result = await uploadToIMGBB(compressed)
            if (result) {
                imgUrl = result.url
                deleteUrl = result.delete_url
            }
        }
        const docref = doc(db, 'recipes', id)
        await updateDoc(docref, { ...updatedData, imgUrl, deleteUrl, updatedAt: serverTimestamp() })
    } catch (error) {
        console.log("Hiba a módosításkor: " + error);

    }
}
//profile update:
export const updateAvatar=async(uid, public_id)=>{
    let oldPublicId = null
    try {
        
        const docRef = doc(db,'avatars',uid)//egy dokumentum referencia
        const docSnap = await getDoc(docRef)
        if(!docSnap.exists()){
            await setDoc(docRef,{uid,public_id})
        }else{
            oldPublicId=docSnap.data().public_id
            await updateDoc(docRef,{public_id})
        }
        if(oldPublicId)await deleteImg(oldPublicId)
    } catch (error) {
        console.log("Avatar törlési hiba!");
        
    }
}
export const deleteAvatar=async(uid)=>{
    console.log(uid+"mybackend");
    let publicId = null
    try {
        const docRef = doc (db, 'avatar', uid)
        const docSnap = await getDoc(docRef)
        //ha nincs ilyen dokumnetum nincs teedő
        if(!docSnap.exists()) return
        else{
            publicId = docSnap.data().public_id
              console.log("Képtörlés előtt" +publicId);
            await deleteImg(publicId)//cloudinaryról töröl
            await deleteDoc(docRef)//firestore:avatars-ból törlés
        }
    } catch (error) {
        console.log("Avatar törlési hiba");
        
    }
}*/