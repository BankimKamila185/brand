CREATE TABLE "warehouses" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "warehouses_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "warehouse_inventory" (
  "id" TEXT NOT NULL,
  "warehouse_id" TEXT NOT NULL,
  "variant_id" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "warehouse_inventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "warehouses_code_key" ON "warehouses"("code");
CREATE INDEX "warehouses_is_active_idx" ON "warehouses"("is_active");
CREATE UNIQUE INDEX "warehouse_inventory_warehouse_id_variant_id_key" ON "warehouse_inventory"("warehouse_id", "variant_id");
CREATE INDEX "warehouse_inventory_warehouse_id_idx" ON "warehouse_inventory"("warehouse_id");
CREATE INDEX "warehouse_inventory_variant_id_idx" ON "warehouse_inventory"("variant_id");
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "warehouse_inventory" ADD CONSTRAINT "warehouse_inventory_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
