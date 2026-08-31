# RBAC (Role Based Access Control) — Is Backend Ka Poora Structure

## Roles (`config/roles.js`)

| Role | Kaam |
|---|---|
| `admin` | Full system access — sab kuch |
| `manager` | Apne project(s) ka full control, approvals |
| `supervisor` | Site level ops — attendance, task update, material request |
| `storekeeper` | Stock/Inventory, GRN, Item master, Vendor item assignment |
| `accountant` | Vendor onboarding, payments, ledger, purchase orders |
| `operator` | Machine usage entries, apne assigned machine ka data |
| `labour` | Sirf apna data — attendance, apne tasks (self-service, mobile) |

Public self-signup (`POST /api/auth/register`) hamesha `labour` role banata hai.
Koi bhi privileged role (`admin/manager/supervisor/storekeeper/accountant/operator`)
sirf **admin** hi bana sakta hai via `POST /api/auth/create-user`.

## Isme Kya Kya Fix Kiya Gaya (is session mein)

### 🔴 Critical Security Bugs
1. **Privilege escalation**: Public `/register` endpoint client se bheja `role`
   field seedha DB me save kar deta tha — koi bhi khud ko "admin" bana sakta
   tha. Ab public signup hamesha `labour` role deta hai; sirf admin-protected
   `/create-user` route se koi bhi role assign ho sakta hai (validated against
   allowed role list).
2. **`machineRoutes.js` — poori file bina authentication ke thi.** Machine add
   karna, list dekhna, maintenance, daily usage — sab bina login ke accessible
   tha. Ab har route par `auth` + `roleCheck` laga diya gaya hai.
3. **Vendor onboarding (`/api/vendor/add`) — koi role check hi nahi tha.**
   Koi bhi logged-in user (labour tak) vendor KYC docs upload kar sakta tha.
   Ab `admin/manager/accountant` tak restricted.
4. **Server-crash bug**: `authRoutes.js` `deleteUser` function import kar raha
   tha jo `authController.js` me define hi nahi tha — Express route register
   karte hi crash ho jaata (server start hi nahi hota). Function ab likh diya
   gaya hai (admin-only, self-delete guard ke saath).
5. **Data leak in `getTasks` (taskController.js)**: sirf `supervisor` /
   `engineer` / `storekeeper` role ko apne tasks tak restrict kiya gaya tha —
   baaki roles (`labour`, `operator`, `accountant`) ko koi filter hi nahi
   milta tha, matlab woh **sabke saare tasks** dekh sakte the. Ab admin/manager
   ke alawa har role apne assigned tasks tak hi restricted hai.
6. **JWT payload mismatch**: token me sirf `id` field hoti hai (`role` ke
   saath), lekin `employeeAttendanceController.js` kahi `req.user._id`
   (undefined) use kar raha tha — jisse "sirf apni attendance dikhao" wala
   filter silently fail ho jaata tha aur galat/khaali data aata tha. Fix kar
   diya gaya — ab consistently `req.user.id` use hota hai.
7. **Dead role names**: code me `"employee"`, `"engineer"` roles use ho rahe
   the jo `User` model ke `enum` me the hi nahi — matlab woh checks kabhi
   trigger hi nahi hote the (permanently broken logic). `User.js` schema me
   real roles add kiye: `storekeeper`, `accountant`. Routes/controllers me
   role names ab schema se match karte hain.

### 🟠 Missing Role Checks (routes jisme sirf `auth` tha, `roleCheck` nahi)
- `reportRoutes.js` — daily report create/delete/approve ab role-restricted.
- `ganttRoutes.js` — Gantt chart tasks create/update/delete ab role-restricted
  (comment tha "adjust roles later" — ab adjust kar diya).
- `assignmentRoutes.js` — machine assign/release ab admin/manager tak.

### 🟡 Dead/Broken Files Removed
- `routes/employeeAttendance.js` — purane employee-attendance routes ka
  duplicate, ek non-existent controller function (`getAllEmployees`) import
  kar raha tha (crash-on-import), server.js me kahi use bhi nahi ho raha
  tha. Delete kar diya.
- `routes/assignWorkRoutes.js` + `models/assignWorkModel.js` — non-existent
  controller (`assignWorkController.js`) import kar rahe the, server.js me
  already comment-out tha, aur is functionality (labour ko kaam assign karna)
  ka poora feature `taskController.js` + `ganttController.js` me already
  properly implemented hai. Duplicate/dead code delete kar diya.

### 🟢 New Roles Wired Through (storekeeper, accountant)
Pehle sirf `admin/manager/supervisor` roles the — jinse "full stock manage",
"full vendor manage" jaisa dedicated role-based access possible nahi tha.
Ab `storekeeper` aur `accountant` roles add kiye gaye hain aur inhe in
modules me sahi jagah access diya gaya hai:
- Stock: receive / transfer / return / issue / ledger → `storekeeper`
- GRN: create / list / ledger → `storekeeper`, view-only → `accountant`
- Item master: add/update → `storekeeper`
- Vendor onboarding + payments context → `accountant`
- Vendor item assignment (ordering) → `storekeeper`

## Module-wise Full Access Matrix

| Module | admin | manager | supervisor | storekeeper | accountant | operator | labour |
|---|---|---|---|---|---|---|---|
| User management (create/delete) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Project create/delete | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Project update / view | ✅ | ✅ | 👁️ (own) | ❌ | ❌ | ❌ | ❌ |
| Labour add/assign | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Labour attendance mark | — | ✅ approve | ✅ mark | ❌ | ❌ | ❌ | 👁️ self |
| Machine add/edit | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Machine view / usage log | ✅ | ✅ | 👁️ | ❌ | ❌ | ✅ | ❌ |
| Machine assignment | ✅ | ✅ | 👁️ | ❌ | ❌ | 👁️ | ❌ |
| Vendor onboarding | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Vendor view / item-assign | ✅ | ✅ | 👁️ | ✅ | 👁️ | ❌ | ❌ |
| Item master | ✅ | ✅ | 👁️ | ✅ | ❌ | ❌ | ❌ |
| Material request raise | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Material request approve | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| GRN (goods receive) | ✅ | ✅ | 👁️ | ✅ | 👁️ | ❌ | ❌ |
| Stock receive/transfer/issue | ✅ | ✅ | 👁️/issue | ✅ | 👁️ | ❌ | ❌ |
| Daily report submit | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Daily report approve | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Task assign | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Task view/update (own) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Gantt chart edit | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Gantt chart view | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

(✅ = full access, 👁️ = view/limited only, ❌ = no access)

## Naya Role Add Karna Ho Toh
1. `config/roles.js` me `ROLES` object me add karo.
2. `models/User.js` me `enum` list me add karo.
3. Jis route/module me chahiye, us route file me `roleCheck("...")` list me
   naya role daal do.

## Test Karne Ka Tarika
```bash
npm install
npm run dev
# Fir Postman/Thunder Client se:
# 1. POST /api/auth/register  -> naya labour user banega
# 2. POST /api/auth/login     -> token milega
# 3. Us token se admin-only routes hit karo -> 403 aana chahiye
```

## Added in the Feature Enhancement pass (Drawing module)

- New role: `drawing_manager` — added to `config/roles.js` (`ROLES.DRAWING_MANAGER`,
  `DRAWING_ROLES`) and to `User.js`'s `role` enum. It reviews drawing requests and
  uploads drawing versions/revisions (`routes/drawingRoutes.js`). `admin` retains
  override access on every drawing route, same god-mode pattern as other roles.
  Create one via the existing admin-only `POST /api/auth/create-user` with
  `role: "drawing_manager"`.
