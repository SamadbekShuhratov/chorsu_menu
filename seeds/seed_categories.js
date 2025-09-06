/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Avval mavjudlarini o'chirish (agar kerak bo‘lsa)
  await knex('categories').del();

  // Yangi kategoriyalar qo‘shish
  await knex('categories').insert([
  { id: '1', name: 'Fast Food', active: true },
  { id: '2', name: 'Ichimliklar', active: true },
  { id: '3', name: 'Shirinliklar', active: true }
]);

}
