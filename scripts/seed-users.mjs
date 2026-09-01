import { createClient } from "@supabase/supabase-js"

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

async function makeUser(email, password, role, meta) {
  // find existing
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  let user = list.users.find((u) => u.email === email)
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: meta,
    })
    if (error) throw error
    user = data.user
    console.log("created", email, user.id)
  } else {
    console.log("exists", email, user.id)
  }
  await admin
    .from("profiles")
    .update({
      role,
      first_name: meta.first_name,
      last_name: meta.last_name,
      phone: meta.phone,
    })
    .eq("id", user.id)
  return user.id
}

const adminId = await makeUser("admin@sushitok.com", "password123", "admin", {
  first_name: "Admin",
  last_name: "Sushi Tok",
  phone: "600000001",
})

const managerId = await makeUser("manager@sushitok.com", "password123", "manager", {
  first_name: "Marco",
  last_name: "Manager",
  phone: "600000002",
})

const staffId = await makeUser("staff@sushitok.com", "password123", "staff", {
  first_name: "Sara",
  last_name: "Staff",
  phone: "600000003",
})

// Assign manager + staff to Alfafar
const { data: rest } = await admin.from("restaurants").select("id, slug")
const alfafar = rest.find((r) => r.slug === "alfafar")
for (const uid of [managerId, staffId]) {
  await admin
    .from("staff_restaurants")
    .upsert({ user_id: uid, restaurant_id: alfafar.id }, { onConflict: "user_id,restaurant_id" })
}
console.log("assigned manager + staff to", alfafar.slug)
console.log("DONE")
