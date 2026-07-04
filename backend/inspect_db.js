const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.product.findUnique({
    where: { handle: 'denim-co-ord-set-light-blue-parachute-baggy-denim-pant-full-shirt-relaxed-fit-copy' },
    include: { variants: true }
  });
  if (p) {
    console.log("Product:", p.title);
    console.log("Variants Option1 values:", p.variants.map(v => v.option1));
    console.log("Variants Option1/title detail:", p.variants.map(v => ({ id: v.id, title: v.title, option1: v.option1 })));
  } else {
    console.log("Product not found in DB");
  }
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
