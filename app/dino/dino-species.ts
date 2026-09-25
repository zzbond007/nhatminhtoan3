// dino-species.ts
// 36 loài khủng long — 6 loài / miền tư duy, khớp với 6 miền sẵn có trong curriculum.ts
// Mỗi loài gắn 1 "vị trí trong miền" (1-6) = DeepMission.sequence của nhiệm vụ cùng miền,
// nên 36 loài ứng đúng 1–1 với 36 nhiệm vụ mà không cần sửa curriculum.ts.
// Cách gán loài cho một nhiệm vụ nằm trong dino-collection-engine.ts (resolveDinoForMission).
//
// Miền dùng đúng DomainId của app/content.ts:
//   number = Quy luật · calculation = Chiến lược · measurement = Mô hình
//   geometry = Hình học · data = Dữ liệu · word = Logic

import type { DomainId } from "../content";

export type Domain = DomainId;

export type Diet = "an-thit" | "an-co" | "an-tap" | "an-ca";

/** Sáu dáng cơ thể gốc để vẽ SVG (dino-art.tsx); `features` tạo khác biệt riêng từng loài. */
export type DinoArchetype = "stripe" | "horn" | "longneck" | "plate" | "flock" | "predator";
export type DinoFeature =
  | "teeth" | "browCrest" | "sail" | "longSnout" | "noseHorn" | "sickleClaw" | "bigClaws" | "feathers" | "giant"
  | "frill" | "bigFrill" | "frillSpikes" | "browHorns" | "beak"
  | "tallFront" | "whipTail" | "archNeck" | "neckSpines" | "wideMouth"
  | "plates" | "tailSpikes" | "shoulderSpikes" | "armor" | "club" | "blocks"
  | "wings" | "crest" | "longNeck" | "bigEyes" | "ringTail"
  | "stripes" | "tubeCrest" | "duckbill" | "dome" | "thumbSpike" | "stiffTail" | "doubleCrest" | "tinyArms";

/** Phần chung của mọi loài: loài cơ bản (gắn nhiệm vụ) và loài Hiếm/Huyền thoại độc lập. */
export interface DinoKind {
  id: string;               // slug duy nhất
  archetype: DinoArchetype;
  features: DinoFeature[];
  name: string;              // tên thân thiện, dễ thương cho bé
  genus: string;              // tên khoa học rút gọn — để bé học thêm kiến thức thật
  diet: Diet;
  funFact: string;            // viết lại, không sao chép nguyên văn bất kỳ nguồn nào
}

export interface DinoSpecies extends DinoKind {
  domain: Domain;
  slotInDomain: 1 | 2 | 3 | 4 | 5 | 6; // vị trí trong 6 loài của miền
}

/** Loài không gắn với nhiệm vụ nào: nở từ Trứng Bí Ẩn, trạm ẩn trên Hành trình hoặc may mắn khi Bứt phá. */
export interface DinoRareSpecies extends DinoKind {
  rarity: "hiem" | "huyen-thoai";
  pool: "tram-an" | "ngau-nhien";
  hue: number;               // màu gốc (HSL) vì không thuộc vùng nào
  branchWeek?: number;       // tuần có trạm ẩn dẫn tới loài này (chỉ với pool "tram-an")
}

export const DINO_REGIONS: Record<Domain, { name: string; description: string }> = {
  number: { name: "Rừng Vằn Lá", description: "Nơi các loài khủng long mang hoa văn, quy luật lặp lại trên cơ thể." },
  calculation: { name: "Cao Nguyên Săn Mồi", description: "Nơi các loài khủng long biết tính toán, phối hợp theo chiến lược." },
  measurement: { name: "Đầm Lầy Kiến Tạo", description: "Nơi các loài khủng long có hình dáng cơ thể đặc biệt, như những cỗ máy sống." },
  geometry: { name: "Sa Mạc Pha Lê", description: "Nơi các loài khủng long có tấm giáp, gai, mào mang hình khối rõ ràng." },
  data: { name: "Bờ Biển San Hô", description: "Nơi các loài khủng long sống theo đàn lớn, gắn với việc đếm và ghi nhớ." },
  word: { name: "Hang Động Băng", description: "Nơi các loài khủng long thông minh, giỏi giải quyết tình huống khó." },
};

export const DINO_SPECIES: DinoSpecies[] = [
  // ===== Miền: Quy luật — Rừng Vằn Lá =====
  { id: "rex-ti-hon", domain: "number", slotInDomain: 1, archetype: "predator", features: ["teeth"], name: "Rex Tí Hon", genus: "Tyrannosaurus (con non)", diet: "an-thit", funFact: "Khi mới nở, Rex con chỉ dài bằng một con gà tây, nhưng lớn rất nhanh mỗi năm." },
  { id: "trice-ba-sung", domain: "number", slotInDomain: 2, archetype: "horn", features: ["frill", "browHorns", "noseHorn"], name: "Trice Ba Sừng", genus: "Triceratops", diet: "an-co", funFact: "Ba chiếc sừng trên đầu mọc theo đúng một vị trí lặp lại ở mọi con cùng loài." },
  { id: "stego-lung-gai", domain: "number", slotInDomain: 3, archetype: "plate", features: ["plates", "tailSpikes"], name: "Stego Lưng Gai", genus: "Stegosaurus", diet: "an-co", funFact: "Những tấm gai trên lưng xếp thành hai hàng đối xứng, lặp lại đều đặn từ cổ đến đuôi." },
  { id: "para-mao-ong", domain: "number", slotInDomain: 4, archetype: "stripe", features: ["tubeCrest", "duckbill", "stripes"], name: "Para Mào Ống", genus: "Parasaurolophus", diet: "an-co", funFact: "Cái mào rỗng trên đầu giúp phát ra âm thanh vang xa để gọi cả đàn." },
  { id: "anky-giap-sat", domain: "number", slotInDomain: 5, archetype: "plate", features: ["armor", "club"], name: "Anky Giáp Sắt", genus: "Ankylosaurus", diet: "an-co", funFact: "Toàn thân phủ những mảng giáp xếp theo một khuôn mẫu lặp lại để bảo vệ cơ thể." },
  { id: "compi-nho-xiu", domain: "number", slotInDomain: 6, archetype: "flock", features: ["stripes"], name: "Compi Nhỏ Xíu", genus: "Compsognathus", diet: "an-thit", funFact: "Một trong những loài khủng long nhỏ nhất từng được tìm thấy, chỉ to hơn một con gà một chút." },

  // ===== Miền: Chiến lược — Cao Nguyên Săn Mồi =====
  { id: "velo-tinh-ranh", domain: "calculation", slotInDomain: 1, archetype: "flock", features: ["feathers", "sickleClaw"], name: "Velo Tinh Ranh", genus: "Velociraptor", diet: "an-thit", funFact: "Nhiều nhà khoa học cho rằng loài này săn mồi theo nhóm để cùng nhau vây bắt con mồi lớn." },
  { id: "styra-khien-song", domain: "calculation", slotInDomain: 2, archetype: "horn", features: ["frill", "frillSpikes", "noseHorn"], name: "Styra Khiên Sống", genus: "Styracosaurus", diet: "an-co", funFact: "Vòng sừng quanh cổ giống như một tấm khiên, giúp cả đàn đứng thành vòng bảo vệ con non." },
  { id: "allo-vua-san", domain: "calculation", slotInDomain: 3, archetype: "predator", features: ["browCrest", "teeth"], name: "Allo Vua Săn", genus: "Allosaurus", diet: "an-thit", funFact: "Là một trong những loài săn mồi lớn nhất thời của nó, thường mai phục thay vì rượt đuổi lâu." },
  { id: "eu-giap-chuy", domain: "calculation", slotInDomain: 4, archetype: "plate", features: ["armor", "club"], name: "Eu Giáp Chuỳ", genus: "Euoplocephalus", diet: "an-co", funFact: "Chiếc đuôi hình chuỳ có thể vung theo nhiều hướng để chọn đúng góc phòng thủ." },
  { id: "utah-mong-vuot", domain: "calculation", slotInDomain: 5, archetype: "predator", features: ["feathers", "sickleClaw"], name: "Utah Móng Vuốt", genus: "Utahraptor", diet: "an-thit", funFact: "Có móng vuốt chân sau rất lớn, được cho là vũ khí chính khi săn mồi." },
  { id: "diablo-sung-quy", domain: "calculation", slotInDomain: 6, archetype: "horn", features: ["frill", "frillSpikes", "browHorns"], name: "Diablo Sừng Quỷ", genus: "Diabloceratops", diet: "an-co", funFact: "Những chiếc sừng cong đặc biệt trên vòng cổ giúp nhận ra nhau trong đàn." },

  // ===== Miền: Mô hình — Đầm Lầy Kiến Tạo =====
  { id: "bra-co-dai", domain: "measurement", slotInDomain: 1, archetype: "longneck", features: ["tallFront"], name: "Bra Cổ Dài", genus: "Brachiosaurus", diet: "an-co", funFact: "Cổ dài giúp vươn tới những chiếc lá cao mà loài khác không ăn được." },
  { id: "diplo-duoi-roi", domain: "measurement", slotInDomain: 2, archetype: "longneck", features: ["whipTail"], name: "Diplo Đuôi Roi", genus: "Diplodocus", diet: "an-co", funFact: "Cơ thể dài như một cây cầu sống, đuôi mảnh như một chiếc roi." },
  { id: "spino-buom-lung", domain: "measurement", slotInDomain: 3, archetype: "predator", features: ["sail", "longSnout"], name: "Spino Buồm Lưng", genus: "Spinosaurus", diet: "an-ca", funFact: "Cánh buồm lớn trên lưng có thể giúp hấp thụ hoặc toả nhiệt." },
  { id: "pachy-dau-vom", domain: "measurement", slotInDomain: 4, archetype: "stripe", features: ["dome"], name: "Pachy Đầu Vòm", genus: "Pachycephalosaurus", diet: "an-tap", funFact: "Phần đỉnh đầu dày và tròn như một chiếc mũ bảo hiểm tự nhiên." },
  { id: "ptera-canh-da", domain: "measurement", slotInDomain: 5, archetype: "flock", features: ["wings", "crest"], name: "Ptera Cánh Da", genus: "Pteranodon", diet: "an-ca", funFact: "Không phải khủng long thật sự mà là loài bò sát bay cùng thời, với đôi cánh bằng da rất rộng." },
  { id: "igua-ngon-cai", domain: "measurement", slotInDomain: 6, archetype: "stripe", features: ["thumbSpike"], name: "Igua Ngón Cái", genus: "Iguanodon", diet: "an-co", funFact: "Có một chiếc gai nhọn ở ngón tay cái, ban đầu các nhà khoa học từng nhầm là một chiếc sừng mũi." },

  // ===== Miền: Hình học — Sa Mạc Pha Lê =====
  { id: "kentro-gai-tam-giac", domain: "geometry", slotInDomain: 1, archetype: "plate", features: ["plates", "tailSpikes", "shoulderSpikes"], name: "Kentro Gai Tam Giác", genus: "Kentrosaurus", diet: "an-co", funFact: "Những chiếc gai hình tam giác xếp dọc theo sống lưng và đuôi." },
  { id: "nodo-giap-tron", domain: "geometry", slotInDomain: 2, archetype: "plate", features: ["armor"], name: "Nodo Giáp Tròn", genus: "Nodosaurus", diet: "an-co", funFact: "Lớp giáp gồm nhiều mảnh tròn xếp khít như một tấm lát đá." },
  { id: "ptero-hinh-thoi", domain: "geometry", slotInDomain: 3, archetype: "flock", features: ["wings"], name: "Ptero Hình Thoi", genus: "Pterodactylus", diet: "an-ca", funFact: "Khi xoè rộng, đôi cánh da tạo thành một hình gần giống hình thoi lớn." },
  { id: "mamen-co-cung", domain: "geometry", slotInDomain: 4, archetype: "longneck", features: ["archNeck"], name: "Mamen Cổ Cung", genus: "Mamenchisaurus", diet: "an-co", funFact: "Có chiếc cổ dài nhất trong các loài khủng long từng biết, uốn cong như một hình cung khổng lồ." },
  { id: "sai-giap-khoi", domain: "geometry", slotInDomain: 5, archetype: "plate", features: ["armor", "club", "blocks"], name: "Sai Giáp Khối", genus: "Saichania", diet: "an-co", funFact: "Toàn thân phủ những tấm giáp hình khối nhỏ ghép sát nhau." },
  { id: "toro-khien-tam-giac", domain: "geometry", slotInDomain: 6, archetype: "horn", features: ["frill", "bigFrill", "browHorns"], name: "Toro Khiên Tam Giác", genus: "Torosaurus", diet: "an-co", funFact: "Có chiếc khiên xương trên đầu thuộc hàng lớn nhất trong mọi loài động vật trên cạn từng biết." },

  // ===== Miền: Dữ liệu — Bờ Biển San Hô =====
  { id: "ovi-ap-trung", domain: "data", slotInDomain: 1, archetype: "flock", features: ["crest", "feathers"], name: "Ovi Ấp Trứng", genus: "Oviraptor", diet: "an-tap", funFact: "Từng bị hiểu lầm là kẻ trộm trứng, nhưng thật ra là một người mẹ đang ấp tổ trứng của chính mình." },
  { id: "maia-me-hien", domain: "data", slotInDomain: 2, archetype: "stripe", features: ["duckbill", "stripes"], name: "Maia Mẹ Hiền", genus: "Maiasaura", diet: "an-co", funFact: "Tên loài này có nghĩa là 'thằn lằn mẹ tốt bụng', vì chăm sóc con non rất kỹ trong tổ." },
  { id: "galli-chay-dan", domain: "data", slotInDomain: 3, archetype: "flock", features: ["longNeck"], name: "Galli Chạy Đàn", genus: "Gallimimus", diet: "an-tap", funFact: "Sống và di chuyển theo đàn lớn, càng đông thì càng an toàn trước kẻ săn mồi." },
  { id: "micro-ti-hon", domain: "data", slotInDomain: 4, archetype: "flock", features: ["wings", "feathers"], name: "Micro Tí Hon", genus: "Microraptor", diet: "an-thit", funFact: "Là một trong những loài khủng long có cánh nhỏ nhất từng được tìm thấy, có tới bốn cánh." },
  { id: "argen-khong-lo", domain: "data", slotInDomain: 5, archetype: "longneck", features: ["giant"], name: "Argen Khổng Lồ", genus: "Argentinosaurus", diet: "an-co", funFact: "Được xem là một trong những loài khủng long nặng nhất từng sống, nặng bằng hàng chục con voi." },
  { id: "lepto-chan-manh", domain: "data", slotInDomain: 6, archetype: "horn", features: ["beak", "frill"], name: "Lepto Chân Mảnh", genus: "Leptoceratops", diet: "an-co", funFact: "Một loài khủng long sừng cỡ nhỏ, chân nhanh nhẹn, thường di chuyển theo nhóm nhỏ." },

  // ===== Miền: Logic — Hang Động Băng =====
  { id: "trood-thong-minh", domain: "word", slotInDomain: 1, archetype: "flock", features: ["feathers", "bigEyes"], name: "Trood Thông Minh", genus: "Troodon", diet: "an-tap", funFact: "Có kích thước não lớn so với cơ thể, được cho là một trong những loài khủng long thông minh nhất." },
  { id: "deino-kinh-hoang", domain: "word", slotInDomain: 2, archetype: "flock", features: ["feathers", "sickleClaw"], name: "Deino Kinh Hoàng", genus: "Deinonychus", diet: "an-thit", funFact: "Sở hữu móng chân hình lưỡi liềm sắc bén, dùng để xử lý những tình huống săn mồi khó." },
  { id: "cerato-sung-mui", domain: "word", slotInDomain: 3, archetype: "predator", features: ["noseHorn", "teeth"], name: "Cerato Sừng Mũi", genus: "Ceratosaurus", diet: "an-thit", funFact: "Có một chiếc sừng nhỏ đặc biệt ngay trên mũi, khác với hầu hết các loài ăn thịt khác." },
  { id: "thesce-duoi-cung", domain: "word", slotInDomain: 4, archetype: "stripe", features: ["stiffTail"], name: "Thesce Đuôi Cứng", genus: "Thescelosaurus", diet: "an-co", funFact: "Chiếc đuôi cứng giúp giữ thăng bằng tốt khi cần né tránh nhanh." },
  { id: "segno-nhanh-tri", domain: "word", slotInDomain: 5, archetype: "flock", features: ["bigClaws", "feathers"], name: "Segno Nhanh Trí", genus: "Segnosaurus", diet: "an-tap", funFact: "Có móng vuốt dài bất thường, được cho là dùng để tìm thức ăn hơn là chiến đấu." },
  { id: "rex-vua-cuoi", domain: "word", slotInDomain: 6, archetype: "predator", features: ["teeth", "giant"], name: "Rex Vua Cuối Cùng", genus: "Tyrannosaurus (trưởng thành)", diet: "an-thit", funFact: "Khi trưởng thành, trở thành một trong những kẻ săn mồi đứng đầu chuỗi thức ăn thời của nó." },
];

export const DINO_RARE_REGIONS = {
  "tram-an": { name: "Trạm Ẩn", description: "Chỉ mở khi con Bứt phá ở trạm ngay trước trên Hành trình." },
  "ngau-nhien": { name: "Đảo Bí Ẩn", description: "Nơi những quả trứng bất ngờ xuất hiện." },
} as const;

export const DINO_RARE_SPECIES: DinoRareSpecies[] = [
  // ===== Trạm ẩn trên Hành trình — mỗi 6 tuần một trạm =====
  { id: "psitta-mo-vet", rarity: "hiem", pool: "tram-an", branchWeek: 6, hue: 48, archetype: "horn", features: ["beak"], name: "Psitta Mỏ Vẹt", genus: "Psittacosaurus", diet: "an-co", funFact: "Có chiếc mỏ khoằm giống mỏ vẹt, dùng để cắt những cành cây cứng." },
  { id: "dilo-hai-mao", rarity: "hiem", pool: "tram-an", branchWeek: 12, hue: 18, archetype: "predator", features: ["doubleCrest", "teeth"], name: "Dilo Hai Mào", genus: "Dilophosaurus", diet: "an-thit", funFact: "Trên đầu có hai chiếc mào mỏng xếp song song như hai chiếc quạt nhỏ." },
  { id: "edmonto-mo-vit", rarity: "hiem", pool: "tram-an", branchWeek: 18, hue: 95, archetype: "stripe", features: ["duckbill", "stripes"], name: "Edmonto Mỏ Vịt", genus: "Edmontosaurus", diet: "an-co", funFact: "Có hàng trăm chiếc răng xếp khít thành một bàn nghiền để nhai cây cỏ." },
  { id: "amarga-co-gai", rarity: "hiem", pool: "tram-an", branchWeek: 24, hue: 150, archetype: "longneck", features: ["neckSpines"], name: "Amarga Cổ Gai", genus: "Amargasaurus", diet: "an-co", funFact: "Có hai hàng gai dài chạy dọc cổ và lưng, trông như một chiếc lược khổng lồ." },
  { id: "carno-sung-bo", rarity: "hiem", pool: "tram-an", branchWeek: 30, hue: 0, archetype: "predator", features: ["browHorns", "tinyArms", "teeth"], name: "Carno Sừng Bò", genus: "Carnotaurus", diet: "an-thit", funFact: "Tên loài có nghĩa là “bò ăn thịt” vì có hai sừng ngắn phía trên mắt; đôi tay thì rất ngắn." },
  { id: "niger-mieng-rong", rarity: "hiem", pool: "tram-an", branchWeek: 36, hue: 190, archetype: "longneck", features: ["wideMouth"], name: "Niger Miệng Rộng", genus: "Nigersaurus", diet: "an-co", funFact: "Miệng rộng và thẳng như đầu máy hút bụi, với hàng trăm chiếc răng liên tục mọc thay." },

  // ===== Đảo Bí Ẩn — nở từ Trứng Bí Ẩn hoặc may mắn khi Bứt phá, giải hai cách, làm bài toán mở =====
  { id: "sino-duoi-soc", rarity: "hiem", pool: "ngau-nhien", hue: 28, archetype: "flock", features: ["feathers", "ringTail"], name: "Sino Đuôi Sọc", genus: "Sinosauropteryx", diet: "an-thit", funFact: "Là một trong những loài khủng long đầu tiên được đoán ra màu lông: chiếc đuôi có sọc nâu xen trắng." },
  { id: "kosmo-nhieu-sung", rarity: "hiem", pool: "ngau-nhien", hue: 352, archetype: "horn", features: ["frill", "frillSpikes", "browHorns", "noseHorn"], name: "Kosmo Nhiều Sừng", genus: "Kosmoceratops", diet: "an-co", funFact: "Có khoảng 15 chiếc sừng và gai trên đầu, thuộc hàng nhiều sừng nhất trong họ khủng long sừng." },
  { id: "ourano-buom-hien", rarity: "hiem", pool: "ngau-nhien", hue: 210, archetype: "stripe", features: ["sail", "thumbSpike"], name: "Ourano Buồm Hiền", genus: "Ouranosaurus", diet: "an-co", funFact: "Một loài ăn cỏ có cánh buồm trên lưng giống Spinosaurus, nhưng lại rất hiền lành." },
  { id: "theri-vuot-dai", rarity: "huyen-thoai", pool: "ngau-nhien", hue: 38, archetype: "flock", features: ["bigClaws", "feathers", "giant"], name: "Theri Vuốt Dài", genus: "Therizinosaurus", diet: "an-co", funFact: "Có những móng vuốt dài bậc nhất thế giới khủng long, nhưng chủ yếu dùng để kéo cành lá." },
  { id: "quetzal-sai-canh", rarity: "huyen-thoai", pool: "ngau-nhien", hue: 196, archetype: "flock", features: ["wings", "crest", "giant"], name: "Quetzal Sải Cánh", genus: "Quetzalcoatlus", diet: "an-thit", funFact: "Bò sát bay lớn bậc nhất từng biết, sải cánh rộng ngang một chiếc máy bay nhỏ; không phải khủng long thật sự." },
  { id: "giga-chua-te", rarity: "huyen-thoai", pool: "ngau-nhien", hue: 12, archetype: "predator", features: ["teeth", "browCrest", "giant"], name: "Giga Chúa Tể", genus: "Giganotosaurus", diet: "an-thit", funFact: "Một trong những loài khủng long ăn thịt lớn nhất, dài ngang hoặc hơn cả khủng long bạo chúa." },
];

export function getRareSpeciesById(id: string): DinoRareSpecies | undefined {
  return DINO_RARE_SPECIES.find((s) => s.id === id);
}

/** Tìm bất kỳ loài nào (cơ bản hoặc hiếm) theo id — dùng cho Tổ ấm và Bộ sưu tập. */
export function getDinoKindById(id: string): DinoSpecies | DinoRareSpecies | undefined {
  return getSpeciesById(id) ?? getRareSpeciesById(id);
}

export function getSpeciesById(id: string): DinoSpecies | undefined {
  return DINO_SPECIES.find((s) => s.id === id);
}

export function getSpeciesByDomainSlot(domain: Domain, slot: number): DinoSpecies | undefined {
  return DINO_SPECIES.find((s) => s.domain === domain && s.slotInDomain === slot);
}
