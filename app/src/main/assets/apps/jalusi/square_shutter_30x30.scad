// ==============================================================
// PROYEK: JENDELA JALUSI 30x30 CM - SISTEM BATANG KAYU PENGGERAK DENGAN BAUT
// Desain 100% Sesuai Standar DIY Kayu YouTube:
// Menggunakan 1 Batang Kayu Penggerak yang DIBAUT ke Tiap Bilah Kisi
// Satuan: Milimeter (mm) [300 mm = 30 cm]
// ==============================================================

$fn = 32;

// --- PARAMETER BUKA-TUTUP (TILT ANGLE) ---
// 0.0 = Menutup Rapat (~10 derajat)
// 1.0 = Membuka Plong (~85 derajat)
tilt_factor = 0.5; 

// --- 1. KUSEN UTAMA (FRAME) ---
outer_w  = 300;   // Lebar luar kusen (30 cm)
outer_h  = 300;   // Tinggi luar kusen (30 cm)
frame_d  = 50;    // Kedalaman kusen (5 cm)
frame_th = 25;    // Tebal kayu kusen keliling (2.5 cm)

clear_w  = outer_w - (2 * frame_th); // 250 mm
clear_h  = outer_h - (2 * frame_th); // 250 mm

// --- 2. BILAH KISI JALUSI (LOUVER SLATS) ---
slat_len   = clear_w - 6; // 244 mm
slat_w     = 34;          // Lebar bilah (3.4 cm)
slat_th    = 8;           // Tebal bilah (8 mm)
slat_pitch = 28;          // Jarak antar poros (2.8 cm)
slat_count = 8;           // Jumlah bilah

// Sudut rotasi (10 s.d. 85 derajat)
rot_angle = 10 + (tilt_factor * 75);

// Jarak titik baut engkol dari as poros tengah bilah
bolt_offset = (slat_w / 2) - 4; // 13 mm dari as poros

// --- 3. BATANG KAYU PENGGERAK (WOODEN ACTUATOR BAR) ---
actuator_w  = 14;  // Lebar batang kayu penggerak (1.4 cm)
actuator_th = 8;   // Tebal batang kayu penggerak (8 mm)
actuator_h  = (slat_count - 1) * slat_pitch + 24; // Panjang batang kayu (~220 mm)

// Posisi X batang kayu penggerak (di sisi kanan, 2.5 cm dari tepi dalam kusen kanan)
actuator_x_offset = (clear_w / 2) - 25;

// Warna Material
c_frame    = [0.65, 0.42, 0.23]; // Jati Kusen
c_slat     = [0.78, 0.53, 0.30]; // Jati Bilah
c_actuator = [0.72, 0.46, 0.25]; // Batang Kayu Penggerak
c_bolt     = [0.85, 0.75, 0.40]; // Baut Kuningan / Logam

// ==============================================================
// MODUL KUSEN
// ==============================================================
module kusen() {
    color(c_frame)
    difference() {
        cube([outer_w, outer_h, frame_d]);
        translate([frame_th, frame_th, -1])
            cube([clear_w, clear_h, frame_d + 2]);
    }
}

// ==============================================================
// MODUL BILAH KISI DENGAN TITIK BAUT
// ==============================================================
module bilah_kisi_dengan_baut() {
    rotate([rot_angle, 0, 0]) {
        // Papan bilah kisi
        color(c_slat)
        translate([-slat_len/2, -slat_w/2, -slat_th/2])
            cube([slat_len, slat_w, slat_th]);
            
        // Poros pin bambu kiri & kanan
        color(c_bolt) {
            translate([-slat_len/2 - 3, 0, 0])
                rotate([0, 90, 0])
                    cylinder(d = 4.5, h = 4);
            translate([slat_len/2 - 1, 0, 0])
                rotate([0, 90, 0])
                    cylinder(d = 4.5, h = 4);
        }

        // Baut pengait ke batang kayu penggerak
        color(c_bolt)
        translate([actuator_x_offset, bolt_offset, slat_th/2]) {
            cylinder(d = 3.5, h = actuator_th + 3); // Batang baut
            translate([0, 0, actuator_th + 2])
                cylinder(d = 7, h = 2);             // Kepala baut & washer
        }
    }
}

// ==============================================================
// PERAKITAN / ASSEMBLY
// ==============================================================

// 1. Kusen
kusen();

// 2. Susunan 8 Bilah Kisi
center_x = outer_w / 2;
center_z = frame_d / 2;
start_y  = frame_th + 16;

for (i = [0 : slat_count - 1]) {
    curr_y = start_y + (i * slat_pitch);
    translate([center_x, curr_y, center_z])
        bilah_kisi_dengan_baut();
}

// 3. Batang Kayu Penggerak yang Dibaut
// Posisi mengikuti busur lingkaran rotasi bilah
act_shift_y = -sin(rot_angle) * bolt_offset;
act_shift_z =  cos(rot_angle) * bolt_offset;

act_pos_x = center_x + actuator_x_offset;
act_pos_y = start_y + ((slat_count - 1) * slat_pitch / 2) + act_shift_y;
act_pos_z = center_z + act_shift_z + (actuator_th / 2) + 2;

color(c_actuator)
translate([act_pos_x - (actuator_w/2), act_pos_y - (actuator_h/2), act_pos_z])
    cube([actuator_w, actuator_h, actuator_th]);
