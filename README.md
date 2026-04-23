--- Events For Everyone (E4E)---
  Az alkalmazás fő rendeltetése, hogy embereket hozzon össze és közös, új élményeket tegyen számukra elérhetővé. 
  A fejlesztés hátterében az a felismerés áll, hogy a közösségi média térnyerése negatív hatással van a személyes, valós kapcsolatokra, amelyeket ez az alkalmazás hivatott erősíteni.
Az program funkciói: 
- A fő oldalon látható:
      - Bejelentkezés gomb – a felhasználói fiókba való belépéshez
      - Esemény létrehozása gomb – új esemény szervezésének megkezdéséhez
      - Események gomb – a meglévő események böngészéséhez
      - Kiemelt események szekció – amelyben a legújabb és legnépszerűbb események kerülnek kiemelésre, lapozható kártya formátumban
      ![Fő oldal](https://res.cloudinary.com/denrhq4ia/image/upload/v1776928368/home_efwr7v.webp)
  - Események szervezése(annak későbbi módosítását):
      - leírás hozzáadása
      - cím megadása
      - képek feltöltése
      - helyszín meghetározása
      - esemény időpontjának kijelölése
  - Eseményekre való jelentkezés:
      - Egy esemény megtekintésekor lehetőség nyílik a jelentkezésre, amelyet a szervező is lát.
  - Saját profil létrehozás:
      - Profil létrehozásának lehetősége
      - Profil törlésének lehetősége
      - Bejelentkezés a profilba
      - Profilkép hozzáadása, szerkesztése és törlése
  - Események oldal:
      - Az események oldalon az összes elérhető esemény böngészhető. A felületen egy keresősáv segítségével szűrhetők az események. Az események kártya formátumban jelennek meg, amelyeken az alábbi információk láthatók: az esemény neve, helyszíne, rövid leírása, a szervező neve, valamint a jelentkezők száma.
      ![Fő oldal](https://res.cloudinary.com/denrhq4ia/image/upload/v1776928368/home_efwr7v.webp)
   Képernyőképekkel
c) Mennyiben más (reszponzív) a kinézet mobilon? (10p)
   Képernyőképekkel
    
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
d) Hogyan tárolja az adatokat? (5p)
   ![Profil mobil nézet](https://res.cloudinary.com/denrhq4ia/image/upload/v1776933987/database_s3nvcc.png)
e) Melyek a fontosabb backend végpontok? (10p)
   1. POST /users/register — Ez az alapja mindennek, hiszen felhasználó nélkül az alkalmazás többi funkciója nem használható. Létrehozza a Firebase Auth fiókot és a Firestore felhasználói dokumentumot egyszerre.

Paraméterek (body): name, email, password
Visszatér: { ok: true, uid } — 201-es státusszal
Hibakezelés: 400 ha hiányos adat, 409 ha az e-mail már foglalt, 500 szerver hiba esetén


2. POST /events — requireAuth — A regisztráció után ez a második legfontosabb végpont, mivel az alkalmazás fő funkciója az eseményszervezés. Csak hitelesített felhasználó hozhat létre eseményt.

Paraméterek (body): title (kötelező), description, location, date (yyyy.mm.dd), time (hh:mm), imageUrl, images
Visszatér: { ok: true, id } — 201-es státusszal
Hibakezelés: 400 ha a cím hiányzik vagy a dátum/idő formátuma hibás, 401 ha nincs token, 500 szerver hiba esetén


3. GET /events — Ez a végpont tölti be az összes eseményt a főoldalra, tehát minden látogató számára elérhető, nem igényel bejelentkezést. Nélküle az alkalmazás üres lenne.

Paraméterek (query): limit (alapértelmezett: 50, maximum: 200)
Visszatér: { count, events, limit } — az események létrehozás szerint csökkenő sorrendben
Hibakezelés: 500 szerver hiba esetén


4. POST /events/:id/register — requireAuth — Az alkalmazás másik kulcsfunkciója: eseményre való jelentkezés. Az előző végpontnál azért kerül hátrébb, mert előbb léteznie kell egy eseménynek, amire jelentkezni lehet.

Paraméterek (URL): id — az esemény azonosítója
Visszatér: { ok: true, msg: "Sikeres jelentkezés" } — 200-as státusszal
Hibakezelés: 404 ha az esemény nem létezik, 401 ha nincs token, 500 szerver hiba esetén


5. DELETE /events/:id — requireAuth — Esemény törlése, amely egyúttal az összes kapcsolódó jelentkezést is törli. Ez zárja a sort, mivel a törlés egy meglévő eseményt feltételez, és komplex műveletet hajt végre: először a regisztrációkat törli batch művelettel, majd magát az eseményt.

Paraméterek (URL): id — az esemény azonosítója
Visszatér: { ok: true, msg: "Sikeres törlés" } — 200-as státusszal
Hibakezelés: 404 ha az esemény nem található, 403 ha nem a saját eseménye, 401 ha nincs token, 500 szerver hiba esetén

   Frontend tesztek, képernyőképekkel
   Backend tesztek, képernyőképekkel

