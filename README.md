# Events For Everyone (E4E)

  Az alkalmazás fő rendeltetése, hogy embereket hozzon össze és közös, új élményeket tegyen számukra elérhetővé. 
  A fejlesztés hátterében az a felismerés áll, hogy a közösségi média térnyerése negatív hatással van a személyes, valós kapcsolatokra, amelyeket ez az alkalmazás hivatott erősíteni.

  <ins>A publikált weboldal linkje:</ins>    [Events4Everyone](https://events4everyone.netlify.app/)
  
## Az program funkciói: 
  ### 1.  **A fő oldalon látható:**
  - Bejelentkezés gomb – a felhasználói fiókba való belépéshez
  - Esemény létrehozása gomb – új esemény szervezésének megkezdéséhez
  - Események gomb – a meglévő események böngészéséhez
  - Kiemelt események szekció – amelyben a legújabb és legnépszerűbb események kerülnek kiemelésre, lapozható kártya formátumban
  ![Fő oldal](https://res.cloudinary.com/denrhq4ia/image/upload/v1776928368/home_efwr7v.webp)
 ### 2.  **Események szervezése(annak későbbi módosítását):**
  - leírás hozzáadása
  - cím megadása
  - képek feltöltése
  - helyszín meghetározása
  - esemény időpontjának kijelölése
### 3. **Eseményekre való jelentkezés:**
  - Egy esemény megtekintésekor lehetőség nyílik a jelentkezésre, amelyet a szervező is lát.
### 4. **Saját profil létrehozás:**
  - Profil létrehozásának lehetősége
  - Profil törlésének lehetősége
  - Bejelentkezés a profilba
  - Profilkép hozzáadása, szerkesztése és törlése
### 5. **Események oldal:**
  - Az események oldalon az összes elérhető esemény böngészhető. A felületen egy keresősáv segítségével szűrhetők az események. Az események kártya formátumban jelennek meg, amelyeken az alábbi információk láthatók: az esemény neve, helyszíne, rövid leírása, a szervező neve, valamint a jelentkezők száma.

        
![Fő oldal](https://res.cloudinary.com/denrhq4ia/image/upload/v1776928368/home_efwr7v.webp)

## Reszponzív mobilnézet
    
  ![Home mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930698/mobil_home_uws6ha.png)
    
    
  ![Események mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930338/mobil_events_kmtymf.png)
    
    
  ![Esemény mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930338/mobile_details_ezmiq6.png)
    
    
  ![Esemény helyszín mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930338/mobil_map_y0wt4n.png)
    
    
  ![Esemény szerkesztés mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930917/mobil_edit_dxpv8m.png)
    
    
  ![Esemény létrehozás mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930338/mobil_create_xveja8.png)
        
  ![Esemény helyszín megadás mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930337/mobil_create_map_edjmb0.png)
        
  ![Esemény kép feltöltés mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930337/mobil_image_s0hwsq.png)
        
  ![Bejelentkezés mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776930338/mobil_login_wlb7sj.png)
        
  ![Profil mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776931615/mobil_profile_p1dxff.png)

## Ábra az adatbázis kapcsolatokról:
  ![Tábla kapcsolatok](https://res.cloudinary.com/denrhq4ia/image/upload/v1776933987/database_s3nvcc.png)  

## Fontosabb backend végpontok:

  <ins>A Github backend repository linkje:</ins> [E4E_BACKEND](https://github.com/BenceCsordas/E4E_BACKEND)
  
  ### 1. **POST /users/register**
   - Ez az alapja mindennek, hiszen felhasználó nélkül az alkalmazás többi funkciója nem használható. Létrehozza a Firebase Auth fiókot és a Firestore felhasználói dokumentumot egyszerre.

     - Paraméterek (body): name, email, password
     - Visszatér: { ok: true, uid } - 201-es státusszal
     - Hibakezelés: 400 ha hiányos adat, 409 ha az e-mail már foglalt, 500 szerver hiba esetén

  ```
        app.post("/users/register", async (req, res) => {
          try {
            const { name, email, password } = req.body;
            if (!isNonEmptyString(name)) return res.status(400).json({ error: "name is required" });
            if (!isNonEmptyString(email) || !email.includes("@")) return res.status(400).json({ error: "valid email is required" });
            if (!isNonEmptyString(password) || password.length < 6) return res.status(400).json({ error: "password must be at least 6 characters" });
            const userRecord = await auth.createUser({ email: email.trim(), password, displayName: name.trim() });

            await db.collection(USERS).doc(userRecord.uid).set({
              name: name.trim(),
              email: email.trim(),
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            res.status(201).json({ ok: true, uid: userRecord.uid });

         } catch (e) {

            if (e?.code === "auth/email-already-exists") return res.status(409).json({ error: "Email already exists" });
            res.status(500).json({ error: e.message });

         }
      });
```


  ### 2. **POST /events - requireAuth**
   - A regisztráció után ez a második legfontosabb végpont, mivel az alkalmazás fő funkciója az eseményszervezés. Csak hitelesített felhasználó hozhat létre eseményt.
  
     - Paraméterek (body): title (kötelező), description, location, date (yyyy.mm.dd), time (hh:mm), imageUrl, images
     - Visszatér: { ok: true, id } - 201-es státusszal
     - Hibakezelés: 400 ha a cím hiányzik vagy a dátum/idő formátuma hibás, 401 ha nincs token, 500 szerver hiba esetén

```
    app.post("/events", requireAuth, async (req, res) => {
        try {
          const { uid } = req.user;
          const { title, location, description, imageUrl, imageDeleteUrl, images, date, time } = req.body;
      
          if (!isNonEmptyString(title)) return res.status(400).json({ error: "title is required" });
          if (date !== undefined && date !== null && !dateRegex.test(date)) {
            return res.status(400).json({ error: "date format must be yyyy.mm.dd" });
          }

          if (time !== undefined && time !== null && !timeRegex.test(time)) {
            return res.status(400).json({ error: "time format must be hh:mm (e.g. 16:30)" });
          }
      
          const userDoc = await db.collection(USERS).doc(uid).get();
          const userData = userDoc.exists ? userDoc.data() : null;
          const ownerName =
            (userData?.name && String(userData.name).trim()) ||
            (req.user?.name && String(req.user.name).trim()) ||
            (req.user?.email ? String(req.user.email).split("@")[0] : "Unknown");
          const ownerEmail = userData?.email || req.user?.email || null;
          const imagesData = Array.isArray(images) && images.length > 0 ? images : [];
      
          const validDate = isValidDate(date) ? date : null;
          const validTime = isValidTime(time) ? time : null;
      
          const docRef = await db.collection(EVENTS).add({
            title: title.trim(),
            location: isNonEmptyString(location) ? location.trim() : null,
            description: isNonEmptyString(description) ? description.trim() : null,
            imageUrl: isNonEmptyString(imageUrl) ? imageUrl.trim() : (imagesData[0]?.url || null),
            imageDeleteUrl: isNonEmptyString(imageDeleteUrl) ? imageDeleteUrl.trim() : (imagesData[0]?.delete_url || null),
            images: imagesData,
            date: validDate,
            time: validTime,
            // Kényelmi mező a frontendnek: "2026.04.13 16:30" vagy csak "2026.04.13" ha nincs idő
            datetime: validDate ? (validTime ? `${validDate} ${validTime}` : validDate) : null,
            ownerUid: uid,
            ownerName,
            ownerEmail,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      
          res.status(201).json({ ok: true, id: docRef.id });
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
    });
```
  
  
### 3. **GET /events**
  - Ez a végpont tölti be az összes eseményt a főoldalra, tehát minden látogató számára elérhető, nem igényel bejelentkezést. Nélküle az alkalmazás üres lenne.
  
    - Paraméterek (query): limit (alapértelmezett: 50, maximum: 200)
    - Visszatér: { count, events, limit } - az események létrehozás szerint csökkenő sorrendben
    - Hibakezelés: 500 szerver hiba esetén

  ```
      app.get("/events", async (req, res) => {
        try {

          const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
          const snapshot = await db.collection(EVENTS).orderBy("createdAt", "desc").limit(limit).get();
          const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          res.status(200).json({ count: events.length, events, limit });

        } catch (e) {

          res.status(500).json({ error: e.message });

        }
    });
```
  
### 4. **POST /events/:id/register** - requireAuth
  - Az alkalmazás másik kulcsfunkciója: eseményre való jelentkezés. Az előző végpontnál azért kerül hátrébb, mert előbb léteznie kell egy eseménynek, amire jelentkezni lehet.
  
    - Paraméterek (URL): id - az esemény azonosítója
    - Visszatér: { ok: true, msg: "Sikeres jelentkezés" } - 200-as státusszal
    - Hibakezelés: 404 ha az esemény nem létezik, 401 ha nincs token, 500 szerver hiba esetén

```
app.post("/events/:id/register", requireAuth, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const eventDoc = await db.collection(EVENTS).doc(id).get();
    if (!eventDoc.exists) return res.status(404).json({ error: "Esemény nem található" });

    const userDoc = await db.collection(USERS).doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    const regId = `${uid}_${id}`;
    await db.collection(REGISTRATIONS).doc(regId).set({
      uid,
      eventId: id,
      eventTitle: eventDoc.data().title || null,
      userName: userData?.name || req.user?.email?.split("@")[0] || "Unknown",
      userEmail: userData?.email || req.user?.email || null,
      registeredAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true, msg: "Sikeres jelentkezés" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```
  
### 5. **DELETE /events/:id** - requireAuth
  - Esemény törlése, amely egyúttal az összes kapcsolódó jelentkezést is törli. Ez zárja a sort, mivel a törlés egy meglévő eseményt feltételez, és komplex műveletet hajt végre: először a regisztrációkat törli batch művelettel, majd magát az eseményt.
  
    - Paraméterek (URL): id - az esemény azonosítója
    - Visszatér: { ok: true, msg: "Sikeres törlés" } - 200-as státusszal
    - Hibakezelés: 404 ha az esemény nem található, 403 ha nem a saját eseménye, 401 ha nincs token, 500 szerver hiba esetén

```
app.delete("/events/:id", requireAuth, async (req, res) => {
  try {
    const { uid } = req.user;
    const { id } = req.params;

    const ref = db.collection(EVENTS).doc(id);
    const docSnap = await ref.get();
    if (!docSnap.exists) return res.status(404).json({ error: "A megadott esemény nem létezik" });
    if (docSnap.data().ownerUid !== uid) return res.status(403).json({ error: "Nem a te eseményed" });

    const regSnap = await db.collection(REGISTRATIONS).where("eventId", "==", id).get();
    const batch = db.batch();
    regSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await ref.delete();
    res.status(200).json({ ok: true, msg: "Sikeres törlés" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```
## Tesztek

A tesztek Vitest keretrendszerrel készültek


   ### Backend index.js tesztjei
  <ins>A backend tesztjei: </ins> [index.test.js](https://github.com/BenceCsordas/E4E_BACKEND/blob/main/index.test.js)
  ![A backend tesztjei](https://res.cloudinary.com/denrhq4ia/image/upload/v1777355134/backend_p6xjej.png)

   ### Frontend komponensek tesztjei
  <ins>A frontend tesztjei: </ins> [components.test.js](https://github.com/BenceCsordas/E4E_FRONTEND/blob/main/src/components.test.jsx)
  ![A komponensek tesztjei](https://res.cloudinary.com/denrhq4ia/image/upload/v1777355134/komponenstest_un4rx2.png)

  ### Utils.js tesztjei
  <ins>A utils.js tesztjei: </ins> [utils.test.js](https://github.com/BenceCsordas/E4E_FRONTEND/blob/main/src/utils.test.js)
  ![Az util.js tesztjei](https://res.cloudinary.com/denrhq4ia/image/upload/v1777355135/utilstest_amkzth.png)
  
