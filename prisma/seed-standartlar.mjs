/**
 * Seed script: tüm 134 ırk standardı kaydı
 * Çalıştırma: node prisma/seed-standartlar.mjs
 * (VPS'te: cd /var/www/tshf && node prisma/seed-standartlar.mjs)
 */

import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})
const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

const BS = 'https://tshfedstandartlar.com/Breed%20Standards/'
const CS = 'https://tshfedstandartlar.com/Colour%20Standards/'
const TR = 'https://tshfedstandartlar.com/Terminoloji/'

const CATEGORIES = [
  { slug: 'terminoloji', label: 'Terminoloji', fullTitle: 'Terminoloji ve Genel Maddeler', color: '#374151', order: 0 },
  { slug: 'dev-irk', label: 'Dev Irk', fullTitle: 'Dev Irk Tavuk Standartları', color: '#1d4ed8', order: 1 },
  { slug: 'cuce', label: 'Cüce Tavuk', fullTitle: 'Cüce Tavuk Standartları', color: '#7c3aed', order: 2 },
  { slug: 'kaz', label: 'Kaz', fullTitle: 'Kaz Standartları', color: '#047857', order: 3 },
  { slug: 'ordek', label: 'Ördek', fullTitle: 'Ördek Standartları', color: '#0e7490', order: 4 },
  { slug: 'hindi', label: 'Hindi', fullTitle: 'Hindi Standartları', color: '#b45309', order: 5 },
  { slug: 'bec', label: 'Beç Tavuğu', fullTitle: 'Beç Tavuğu Standartları', color: '#be123c', order: 6 },
  { slug: 'yerli', label: 'Yerli Irklar', fullTitle: 'Yerli Irk Standartları', color: '#9a3412', order: 7 },
]

// Standards per category slug
const STANDARDS = {
  terminoloji: [
    { name: 'Bilezik Listesi DEV Tavuk', breedPdfUrl: TR + 'EE Bilezik DEV Tavuk 2026.pdf', breedDate: '16.06.2026' },
    { name: 'Bilezik Listesi CÜCE Tavuk', breedPdfUrl: TR + 'EE Bilezik CÜCE Tavuk 29-04-20.pdf', breedDate: '25.05.2026' },
    { name: 'Bilezik Listesi Ördek Kaz Hindi', breedPdfUrl: TR + 'EE Bilezik Ördek Kaz Hindi 29-04-20.pdf', breedDate: '29.07.2024' },
    { name: 'Irklara Ait Yumurta Verimleri ve Ağırlıkları', breedPdfUrl: TR + 'Yumurta verimi Türkçe - 04092019.pdf', breedDate: '04.09.2019' },
    { name: 'Teknik Terimleri Almanca sıralı', breedPdfUrl: TR + 'Teknik terimleri Almanca -Türkçe 11122019.pdf', breedDate: '04.06.2022' },
    { name: 'Irk Standartları Teknik Terimleri (Türkçe sıralı)', breedPdfUrl: TR + 'Teknik terimleri Türkçe - Almanca 25062026.pdf', breedDate: '25.06.2026' },
    { name: 'Tavuk Vücut Terimleri', breedPdfUrl: TR + 'Tavuk terimleri.pdf', breedDate: '24.01.2019' },
    { name: 'Ördek Vücut Terimleri', breedPdfUrl: TR + 'Ordek terimleri.pdf', breedDate: '03.01.2020' },
    { name: 'Kaz Vücut Terimleri', breedPdfUrl: TR + 'Kaz terimleri.pdf', breedDate: '03.01.2020' },
    { name: 'Hindi Vücut Terimleri', breedPdfUrl: TR + 'Hindi Vucut Terimleri.pdf', breedDate: '24.07.2020' },
    { name: 'Beç Tavuğu Vücut Terimleri', breedPdfUrl: TR + 'Beç Tavugu terimleri.pdf', breedDate: '10.03.2020' },
    { name: 'Evcil Kümes Hayvanlarının Kökeni ve Islah Süreci', breedPdfUrl: TR + 'Evcil kümes Hayvanlarinin Kökeni ve Islah süreci.pdf', breedDate: '01.02.2025' },
    { name: 'Evcil Kanatlıların Vücut Yapısı', breedPdfUrl: TR + 'Evcil Kanatlilarin vücut yapisi.pdf', breedDate: '28.02.2025' },
    { name: 'Evcil Kanatlılarda Tüy Oluşumu', breedPdfUrl: TR + 'Evcil Kanatlılarda Tüy Oluşumu.pdf', breedDate: '28.02.2025' },
    { name: 'Kuluçka Süresi ve Kuluçka Yöntemleri', breedPdfUrl: TR + 'Kulucka_Suresi_ve_Yontemleri_TR.pdf', breedDate: '17.06.2026' },
    { name: "EE'de tanımlanmış DEV tavuk ırkları/renk listesi", breedPdfUrl: TR + 'EE List Dev German-English-Turkish.pdf', breedDate: '24.07.2026' },
    { name: "EE'de tanımlanmış CÜCE tavukları ırk/renk listesi", breedPdfUrl: TR + 'EE List CÜCE Turkish -German-English.pdf', breedDate: '24.07.2026' },
    { name: "EE'de tanımlanmış KAZ ırk/renk listesi", breedPdfUrl: TR + 'EE listesi kaz .pdf', breedDate: '29.07.2024' },
    { name: "EE'de tanımlanmış ÖRDEK ırk/renk listesi", breedPdfUrl: TR + 'EE listesi ordek.pdf', breedDate: '22.08.2025' },
    { name: "EE'de tanımlanmış HINDI ırk/renk listesi", breedPdfUrl: TR + 'EE listesi Hindi.pdf', breedDate: '29.09.2025' },
    { name: 'Yeni Irk ve Renk Tanımlanma Prosedürü', breedPdfUrl: TR + 'Yeni irk-renk tanimlanma prosedürü.pdf', breedDate: '02.07.2024' },
    { name: 'Kanatlıların puanlanması ve eleme sebepleri', breedPdfUrl: TR + 'Kanatlıların Puanlanması - 1.pdf', breedDate: '11.07.2024' },
    { name: 'Tavuk ve Cüce Tavuklarda Renk Tablosu', breedPdfUrl: TR + 'TAVUK RENKLER Table 11082025.pdf', breedDate: '11.08.2025' },
    { name: 'Tavuk ve Cüce Tavuklarda Renk Çeşitlerinin Açıklamaları', breedPdfUrl: TR + 'Tavuklarda renkler ve desenler 30052021.pdf', breedDate: '11.09.2025' },
    { name: 'Ördeklerin Renk Çeşitlerinin Açıklamaları', breedPdfUrl: TR + 'Ördeklerin Renk Çeşitlerinin Açıklamaları.pdf', breedDate: '16.09.2025' },
    { name: 'Kazların Renk Çeşitlerinin Açıklamaları', breedPdfUrl: TR + 'Kazlarin Renkleri ve Desenleri.pdf', breedDate: '13.07.2026' },
  ],
  'dev-irk': [
    { name: 'Alman Faverolles', breedPdfUrl: BS + 'Alman%20Faverolles%20Irk%20Standard.pdf', breedDate: '23.11.2021', colourPdfUrl: CS + 'Alman%20Faverolles%20renk%20standard%C4%B1.pdf', colourDate: '11.10.2021' },
    { name: 'Ameraucana', breedPdfUrl: BS + 'Ameraucana%20standardi.pdf', breedDate: '26.06.2025', colourPdfUrl: CS + 'Dev%20Ameraucana%20renk%20standard%C4%B1.pdf', colourDate: '17.12.2024' },
    { name: 'Amerikan Ligorin', breedPdfUrl: BS + 'Amerikan%20Ligorin%20Irk%20Standart.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'Amerikan%20Ligorin%20Renk%20Standard%C4%B1.pdf', colourDate: '09.05.2023' },
    { name: 'Amrock', breedPdfUrl: BS + 'Amrock%20standardi.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'Amrock%20renk%20standard%C4%B1.pdf', colourDate: '14.07.2020' },
    { name: 'Ancona', breedPdfUrl: BS + 'Ancona%20Standard.pdf', breedDate: '31.12.2022', colourPdfUrl: CS + 'Ancona%20Renklerin%20Standardi.pdf', colourDate: '31.12.2022' },
    { name: 'Appenzell Tepeli', breedPdfUrl: BS + 'Appenzell%20tepeli.pdf', breedDate: '07.12.2024', colourPdfUrl: CS + 'Appenzell%20Tepeli%20Renk%20Standard%C4%B1.pdf', colourDate: '07.12.2024' },
    { name: 'Araucana', breedPdfUrl: BS + 'Araucanas%20Standard.pdf', breedDate: '18.09.2019', colourPdfUrl: CS + 'Araucana%20%28kuyruksuz%29%20renk%20standard.pdf', colourDate: '17.01.2021' },
    { name: 'Araucana (İngiliz)', breedPdfUrl: BS + 'Araucana%20Ingliz%20Standard.pdf', breedDate: '27.11.2024', colourPdfUrl: CS + 'Araucana%20%28%C4%B0NG%C4%B0L%C4%B0Z%29%20Renkler%20Standarti.pdf', colourDate: '27.11.2024' },
    { name: 'Asil', breedPdfUrl: BS + 'Asil%20Standard.pdf', breedDate: '21.05.2024', colourPdfUrl: CS + 'Asil%20Renk%20Standard.pdf', colourDate: '03.05.2024' },
    { name: 'Australorp', breedPdfUrl: BS + 'Australorp%20Standard.pdf', breedDate: '12.12.2024', colourPdfUrl: CS + 'Australorps%20renklerin%20standardi.pdf', colourDate: '21.07.2026' },
    { name: 'Ayam Cemani', breedPdfUrl: BS + 'Ayam%20Cemani%20Standard.pdf', breedDate: '20.02.2021', colourPdfUrl: CS + 'Ayam%20Cemani%20Renk%20Standardi.pdf', colourDate: '14.03.2019' },
    { name: 'Barnevelder', breedPdfUrl: BS + 'Barnevelder%20irk%20standardi.pdf', breedDate: '03.03.2025', colourPdfUrl: CS + 'Barnevelder%20renk%20standard%C4%B1.pdf', colourDate: '03.03.2025' },
    { name: 'Barbezieux', breedPdfUrl: BS + 'Barbezieux%20Irk%20Standard.pdf', breedDate: '23.12.2024', colourPdfUrl: CS + 'Barbezieux%20renk%20standard%C4%B1.pdf', colourDate: '23.12.2024' },
    { name: 'Baykuş Sakallı Tavuk', breedPdfUrl: BS + 'Baykus%20Sakalli%20Tavuk%20irk%20standardi.pdf', breedDate: '15.07.2026', colourPdfUrl: CS + 'Baykus%20Sakalli%20Tavuk%20Renk%20Standardi.pdf', colourDate: '15.07.2026' },
    { name: 'Bielefelder', breedPdfUrl: BS + 'BIELEFELDER%20Standard.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'Bielefelder%20Renk%20Standard%C4%B1.pdf', colourDate: '28.03.2023' },
    { name: 'Brahma', breedPdfUrl: BS + 'Brahma%20Standard.pdf', breedDate: '05.01.2019', colourPdfUrl: CS + 'EE%20Brahma%20renklerin%20standardi.pdf', colourDate: '04.08.2026' },
    { name: 'Brakel', breedPdfUrl: BS + 'Brakel%20Standard.pdf', breedDate: '11.03.2021', colourPdfUrl: CS + 'Brakel%20renk%20standard%C4%B1.pdf', colourDate: '05.08.2023' },
    { name: 'Bresse - Gauloise', breedPdfUrl: BS + 'Bresse%20Standard.pdf', breedDate: '13.07.2026', colourPdfUrl: CS + 'Bresse%20renklerin%20standard%C4%B1.pdf', colourDate: '13.07.2026' },
    { name: 'Cochin', breedPdfUrl: BS + 'Cochin%20Standard.pdf', breedDate: '08.05.2020', colourPdfUrl: CS + 'Cochin%20Dev%20renk%20standardi.pdf', colourDate: '08.07.2022' },
    { name: 'Çıplak boyunlu Habeş', breedPdfUrl: BS + '%C3%87iplak%20boyunlu%20Habes%20standardi.pdf', breedDate: '17.07.2024', colourPdfUrl: CS + '%C3%87iplak%20boyunlu%20Habes%20renk%20standardi.pdf', colourDate: '17.07.2024' },
    { name: 'Çıplak Boyunlu Tavuk', breedPdfUrl: BS + 'Ciplak%20Boyun%20Standard.pdf', breedDate: '22.05.2020', colourPdfUrl: CS + '%C3%87iplak%20boyunlu%20Tavuk%20Renk%20Standardi.pdf', colourDate: '14.09.2020' },
    { name: 'Denizli', breedPdfUrl: BS + 'Denizli%20Standard.pdf', breedDate: '21.07.2026', colourPdfUrl: CS + 'Denizli%20renk%20standardi.pdf', colourDate: '03.05.2024' },
    { name: 'Foniks', breedPdfUrl: BS + 'Foniks%20standardi.pdf', breedDate: '28.01.2023', colourPdfUrl: CS + 'Foniks%20Renk%20Standard%C4%B1.pdf', colourDate: '03.12.2024' },
    { name: 'Habeş Tavuğu', breedPdfUrl: BS + 'Habes%20Tavugu%20Standard.pdf', breedDate: '20.05.2026', colourPdfUrl: CS + 'Habe%C5%9F%20Tavu%C4%9Fu%20renklerin%20standard%C4%B1.pdf', colourDate: '07.12.2023' },
    { name: 'Hamburg', breedPdfUrl: BS + 'Hamburg%20Irk%20Standardi.pdf', breedDate: '20.02.2025', colourPdfUrl: CS + 'Hamburg%20renk%20standardi.pdf', colourDate: '20.02.2025' },
    { name: 'Hindistan Dövüşcüsü', breedPdfUrl: BS + 'Hint%20Oyuncu%20Standard.pdf', breedDate: '02.02.2021', colourPdfUrl: CS + 'Hindistan%20D%C3%B6v%C3%BC%C5%9Fc%C3%BCs%C3%BC%20renklerin%20standardi.pdf', colourDate: '06.12.2020' },
    { name: 'Hollanda Tepeli Tavuğu', breedPdfUrl: BS + 'Hollanda%20Tepeli%20Tavugu.pdf', breedDate: '07.09.2024', colourPdfUrl: CS + 'Hollanda%20Tepeli%20Tavu%C4%9Fu%20renk%20standard%C4%B1.pdf', colourDate: '07.09.2024' },
    { name: 'İspanyol', breedPdfUrl: BS + 'Ispanyol%20Standard.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + '%C4%B0spanyol%20Renk%20standard%C4%B1.pdf', colourDate: '27.12.2022' },
    { name: 'İtalyan', breedPdfUrl: BS + 'Italyan%20Standard.pdf', breedDate: '24.04.2021', colourPdfUrl: CS + '%C4%B0talyan%20Renk%20Standard.pdf', colourDate: '19.01.2021' },
    { name: 'Krem Legbar', breedPdfUrl: BS + 'Krem%20Legbar%20Standard.pdf', breedDate: '29.06.2025', colourPdfUrl: CS + 'Krem%20Legbar%20Renk%20standard%C4%B1.pdf', colourDate: '29.06.2025' },
    { name: 'La Fleche', breedPdfUrl: BS + 'La%20Fleche%20irk%20standard.pdf', breedDate: '18.09.2024', colourPdfUrl: CS + 'La%20Fleche%20renk%20standard%C4%B1.pdf', colourDate: '18.09.2024' },
    { name: 'Lakenvelder', breedPdfUrl: BS + 'Lakenvelder%20Standardi.pdf', breedDate: '21.07.2026', colourPdfUrl: CS + 'Lakenvelder%20renklerin%20standard%C4%B1.pdf', colourDate: '05.12.2024' },
    { name: 'Malay', breedPdfUrl: BS + 'Malay%20Standard.pdf', breedDate: '29.11.2020', colourPdfUrl: CS + 'Malay%20renklerin%20standard%C4%B1.pdf', colourDate: '07.01.2021' },
    { name: 'Maran', breedPdfUrl: BS + 'Maran%20irk%20standardi.pdf', breedDate: '04.08.2026', colourPdfUrl: CS + 'Maran%20Renk%20standardi.pdf', colourDate: '28.01.2023' },
    { name: 'New Hampshire', breedPdfUrl: BS + 'New%20Hampshire%20standardi.pdf', breedDate: '05.09.2022', colourPdfUrl: CS + 'New%20Hampshire%20Renk%20Standard%C4%B1.pdf', colourDate: '13.07.2026' },
    { name: 'Orloff', breedPdfUrl: BS + 'Orloff%20standardi.pdf', breedDate: '19.07.2021', colourPdfUrl: CS + 'Orloff%20renklerin%20standard%C4%B1.pdf', colourDate: '14.08.2021' },
    { name: 'Orpington', breedPdfUrl: BS + 'Orpington%20irk%20standardi.pdf', breedDate: '27.11.2024', colourPdfUrl: CS + 'Orpington%20renk%20standardi.pdf', colourDate: '27.11.2024' },
    { name: 'Pado Fizan', breedPdfUrl: BS + 'Pado%20Fizan%20standard.pdf', breedDate: '15.09.2024', colourPdfUrl: CS + 'Pado%20Fizan%20renk%20standard%C4%B1.pdf', colourDate: '26.11.2024' },
    { name: 'Pavlov', breedPdfUrl: BS + 'Pavlov%20standard%C4%B1.pdf', breedDate: '03.03.2024', colourPdfUrl: CS + 'Pavlov%20Renk%20standard%C4%B1.pdf', colourDate: '03.03.2024' },
    { name: 'Plymouth', breedPdfUrl: BS + 'Plymouth%20Standard.pdf', breedDate: '22.02.2020', colourPdfUrl: CS + 'Plymouth%20Renk%20Standard%C4%B1.pdf', colourDate: '25.01.2021' },
    { name: 'Rhode Island Red (RIR)', breedPdfUrl: BS + 'Rhode%20Island%20Red%20%28RIR%29%20Standard.pdf', breedDate: '07.10.2020', colourPdfUrl: CS + 'Rhode%20Island%20Red%20%28RIR%29%20Renk%20Standardi.pdf', colourDate: '02.02.2025' },
    { name: 'Shamo', breedPdfUrl: BS + 'Shamo%20Standard.pdf', breedDate: '21.05.2021', colourPdfUrl: CS + 'Shamo%20renklerin%20standard%C4%B1.pdf', colourDate: '03.05.2024' },
    { name: 'Sulmtaler', breedPdfUrl: BS + 'Sulmtaler%20irk%20standardi.pdf', breedDate: '28.08.2026', colourPdfUrl: CS + 'Sulmtaler%20renk%20standardi.pdf', colourDate: '28.08.2026' },
    { name: 'Sultan', breedPdfUrl: BS + 'Sultan%20standardi.pdf', breedDate: '04.08.2026', colourPdfUrl: CS + 'Sultan%20renklerin%20standard%C4%B1.pdf', colourDate: '15.09.2024' },
    { name: 'Sumatra', breedPdfUrl: BS + 'Sumatra%20Standard.pdf', breedDate: '28.01.2023', colourPdfUrl: CS + 'Sumatra%20renklerin%20Standard.pdf', colourDate: '29.11.2023' },
    { name: 'Sussex', breedPdfUrl: BS + 'Sussex%20Standard.pdf', breedDate: '10.10.2020', colourPdfUrl: CS + 'Sussex%20renklerin%20standardi.pdf', colourDate: '13.08.2025' },
    { name: 'Thüringer', breedPdfUrl: BS + 'Sakalli%20Th%C3%BCringer.pdf', breedDate: '17.06.2026', colourPdfUrl: CS + 'Sakalll%C4%B1%20Th%C3%BCringer%20Renk%20Standard%C4%B1.pdf', colourDate: '22.01.2021' },
    { name: 'Vorwerk', breedPdfUrl: BS + 'Vorwerk%20Standard.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'Vorwerk%20Renk%20Standard%C4%B1.pdf', colourDate: '17.12.2024' },
    { name: 'Wyandotte Alman', breedPdfUrl: BS + 'Wyandotte%20Standard.pdf', breedDate: '05.02.2020', colourPdfUrl: CS + 'EE%20Wyandotte%20renk%20standardi.pdf', colourDate: '05.08.2023' },
    { name: 'Wyandotte Orijinal', breedPdfUrl: BS + 'Wyandotte%20Orijinal%20standard.pdf', breedDate: '09.09.2024', colourPdfUrl: CS + 'Wyandotte%20orijinal%20renk%20standardi.pdf', colourDate: '13.09.2023' },
    { name: 'Yokohama', breedPdfUrl: BS + 'Yokohama%20irk%20standardi.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'Yokohama%20Renk%20Standard.pdf', colourDate: '02.11.2022' },
  ],
  cuce: [
    { name: 'Antwerp Sakallı Cüce', breedPdfUrl: BS + 'Antwerp%20sakalli%20C%C3%BCce.pdf', breedDate: '29.11.2024', colourPdfUrl: CS + 'Antwerp%20Sakal%C4%B1l%C4%B1%20C%C3%BCce%20renk%20standard%C4%B1.pdf', colourDate: '29.11.2024' },
    { name: 'Chabo Japonez', breedPdfUrl: BS + 'Chabo%20Standard.pdf', breedDate: '05.12.2024', colourPdfUrl: CS + 'Chabo%20renk%20standardi%20(Japonez).pdf', colourDate: '10.08.2023' },
    { name: 'Çıplak boyunlu Cüce Habeş', breedPdfUrl: BS + '%C3%87iplak%20boyunlu%20C%C3%BCce%20Habes.pdf', breedDate: '17.07.2024', colourPdfUrl: CS + '%C3%87iplak%20boyunlu%20C%C3%BCce%20Habes%20renk%20standardi.pdf', colourDate: '17.07.2024' },
    { name: 'Cüce Wyandotte Alman', breedPdfUrl: BS + 'Alman%20C%C3%BCce%20Wyandotte%20standardi.pdf', breedDate: '16.02.2022', colourPdfUrl: CS + 'Alman%20C%C3%BCce%20Wyandotte%20renk%20standardi.pdf', colourDate: '29.05.2024' },
    { name: 'Cüce Wyandotte Orijinal', breedPdfUrl: BS + 'C%C3%BCce%20Wyandotte%20Original%20standardi.pdf', breedDate: '07.09.2024', colourPdfUrl: CS + 'C%C3%BCce%20Wyandotte%20Orijinal%20-%20Renk%20standardi.pdf', colourDate: '29.05.2024' },
    { name: 'Cüce Ameraucana', breedPdfUrl: BS + 'C%C3%BCce%20Ameraucana%20standard%C4%B1.pdf', breedDate: '10.08.2023', colourPdfUrl: CS + 'C%C3%BCce%20Ameraucana%20renk%20standard%C4%B1.pdf', colourDate: '11.10.2023' },
    { name: 'Cüce Amrock', breedPdfUrl: BS + 'C%C3%BCce%20Amrock%20standardi.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'C%C3%BCce%20Amrock%20renk%20standard%C4%B1.pdf', colourDate: '21.04.2022' },
    { name: 'Cüce Asil', breedPdfUrl: BS + 'C%C3%BCce%20Asil%20irk%20standardi.pdf', breedDate: '16.05.2024', colourPdfUrl: CS + 'C%C3%BCce%20Asil%20renk%20standardi.pdf', colourDate: '16.05.2024' },
    { name: 'Cüce Australorp', breedPdfUrl: BS + 'C%C3%BCce%20Australorp%20Standard.pdf', breedDate: '12.12.2024', colourPdfUrl: CS + 'C%C3%BCce%20Australorp%20renklerin%20standardi.pdf', colourDate: '13.12.2024' },
    { name: 'Cüce Bielefelder', breedPdfUrl: BS + 'C%C3%BCce%20Bielefelder%20Standard.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'C%C3%BCce%20Bielefelder%20Renk%20Standard%C4%B1.pdf', colourDate: '02.04.2023' },
    { name: 'Cüce Brahma', breedPdfUrl: BS + 'C%C3%BCce%20Brahma%20standardi.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'C%C3%BCce%20Brahma%20renk%20standard%C4%B1.pdf', colourDate: '02.12.2024' },
    { name: 'Cüce Cochin', breedPdfUrl: BS + 'Cochin%20C%C3%BCce%20standard.pdf', breedDate: '07.11.2019', colourPdfUrl: CS + 'Cochin%20C%C3%BCce%20Renk%20standardi.pdf', colourDate: '10.08.2023' },
    { name: 'Cüce Foniks', breedPdfUrl: BS + 'C%C3%BCce%20Foniks%20Standard.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'C%C3%BCce%20Foniks%20Renklerin%20Standardi.pdf', colourDate: '24.07.2026' },
    { name: 'Cüce Friz Tavuğu', breedPdfUrl: BS + 'C%C3%BCce%20Friz%20Tavugu%20Breed%20Standard.pdf', breedDate: '12.12.2024', colourPdfUrl: CS + 'C%C3%BCce%20Friz%20tavugu%20renk%20standardi.pdf', colourDate: '12.12.2024' },
    { name: 'Cüce Habeş Tavuğu', breedPdfUrl: BS + 'C%C3%BCce%20Habes%20Tavugu%20Standard.pdf', breedDate: '04.08.2026', colourPdfUrl: CS + 'C%C3%BCce%20Habes%20Tavugu%20renklerin%20standardi.pdf', colourDate: '17.07.2024' },
    { name: 'Cüce Hindistan Dövüşçüsü', breedPdfUrl: BS + 'C%C3%BCce%20Hindistan%20D%C3%B6v%C3%BC%C5%9F%C3%A7%C3%BCs%C3%BC%20Irk%20Standard.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'C%C3%BCce%20Hindistan%20D%C3%B6v%C3%BC%C5%9F%C3%A7%C3%BCs%C3%BC%20Renk%20Standard.pdf', colourDate: '09.11.2022' },
    { name: 'Cüce Hollanda Tepeli Tavuğu', breedPdfUrl: BS + 'C%C3%BCce%20Hollanda%20Tepelisi%20Standard.pdf', breedDate: '07.09.2024', colourPdfUrl: CS + 'C%C3%BCce%20Hollanda%20Tepeli%20Tavu%C4%9Fu%20Renklerin%20standard.pdf', colourDate: '07.09.2024' },
    { name: 'Cüce Modern İngiliz Dövüşcüsü', breedPdfUrl: BS + 'C%C3%BCce%20Modern%20%C4%B0ngiliz%20D%C3%B6v%C3%BC%C5%9Fc%C3%BCs%C3%BC%20Irk%20Standard.pdf', breedDate: '18.07.2025', colourPdfUrl: CS + 'Modern%20%C4%B0ngiliz%20D%C3%B6v%C3%BC%C5%9Fc%C3%BCs%C3%BC%20renk%20standard%C4%B1.pdf', colourDate: '03.12.2024' },
    { name: 'Cüce Orpington', breedPdfUrl: BS + 'C%C3%BCce%20Orpington%20irk%20standardi.pdf', breedDate: '27.11.2024', colourPdfUrl: CS + 'C%C3%BCce%20Orpington%20renk%20standardi.pdf', colourDate: '27.11.2024' },
    { name: 'Cüce Pado Fizan', breedPdfUrl: BS + 'C%C3%BCce%20Pado%20Fizan%20Irk%20Standard.pdf', breedDate: '15.09.2024', colourPdfUrl: CS + 'C%C3%BCce%20Pado%20Fizan%20renklerin%20standard%20.pdf', colourDate: '05.11.2022' },
    { name: 'Cüce Vorwerk', breedPdfUrl: BS + 'C%C3%BCce%20VORWERK%20Standard.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'C%C3%BCce%20Vorwerk%20Renk%20Standard%C4%B1.pdf', colourDate: '27.12.2022' },
    { name: 'Grübbe Sakallı Cüce', breedPdfUrl: BS + 'Gr%C3%BCbbe%20Sakalli%20C%C3%BCce.pdf', breedDate: '04.07.2024', colourPdfUrl: CS + 'Gr%C3%BCbbe%20Sakal%C4%B1%20C%C3%BCce%20Renk%20Standard%C4%B1.pdf', colourDate: '28.12.2022' },
    { name: 'Gül ibikli Bantam', breedPdfUrl: BS + 'G%C3%BCl%20ibikli%20Bantam%20Standard.pdf', breedDate: '12.12.2024', colourPdfUrl: CS + 'G%C3%BCl%20ibikli%20Bantam%20Renk%20Standard.pdf', colourDate: '30.11.2024' },
    { name: 'İSPENÇ', breedPdfUrl: BS + 'Ispen%C3%A7%20standardi.pdf', breedDate: '16.03.2025', colourPdfUrl: CS + '%C4%B0spen%C3%A7%20Renk%20Standard%C4%B1.pdf', colourDate: '16.03.2025' },
    { name: 'Ko Shamo', breedPdfUrl: BS + 'Ko%20Shamo%20standardi.pdf', breedDate: '24.04.2021', colourPdfUrl: CS + 'Ko%20Shamo%20renklerin%20standard%C4%B1.pdf', colourDate: '15.04.2021' },
    { name: 'Paçalı Cüce (Sabelpoot)', breedPdfUrl: BS + 'Pa%C3%A7ali%20%C3%87%C3%BCce%20(Sabelpoot)%20Standard.pdf', breedDate: '07.10.2020', colourPdfUrl: CS + 'Pa%C3%A7ali%20C%C3%BCce%20(Sabelpoot)%20renk%20standardi.pdf', colourDate: '18.02.2021' },
    { name: 'Serama', breedPdfUrl: BS + 'Serama%20standard.pdf', breedDate: '20.06.2020', colourPdfUrl: CS + 'Serama%20renkler%20Standard%C4%B1.pdf', colourDate: '10.08.2023' },
    { name: 'Ükkel Sakallı Cüce', breedPdfUrl: BS + '%C3%9Ckkel%20Sakalli%20C%C3%BCce%20Standard.pdf', breedDate: '23.09.2021', colourPdfUrl: CS + '%C3%9Ckkel%20Sakalli%20C%C3%BCce%20Renk%20Standard.pdf', colourDate: '15.07.2021' },
    { name: 'Zibrit', breedPdfUrl: BS + 'Zibrit%20standard.pdf', breedDate: '01.03.2020', colourPdfUrl: CS + 'Zibrit%20Renk%20Standardi.pdf', colourDate: '20.05.2026' },
  ],
  kaz: [
    { name: 'Afrika Kazı', breedPdfUrl: BS + 'Afrika%20Kaz%C4%B1%20Standard.pdf', breedDate: '17.04.2019', colourPdfUrl: CS + 'Afrika%20Kaz%C4%B1%20renklerin%20standard%C4%B1.pdf', colourDate: '17.04.2019' },
    { name: 'Amerikan Kazı', breedPdfUrl: BS + 'Amerikan%20Kaz%C4%B1%20Stanfard.pdf', breedDate: '17.04.2019', colourPdfUrl: CS + 'Amerikan%20Kaz%C4%B1%20renklerin%20standard%C4%B1.pdf', colourDate: '17.04.2019' },
    { name: 'Çin Kazı', breedPdfUrl: BS + 'Cin%20Kazi%20Standard.pdf', breedDate: '06.07.2025', colourPdfUrl: CS + '%C3%87in%20Kaz%C4%B1%20Renk%20Standard%C4%B1.pdf', colourDate: '06.07.2025' },
    { name: 'Doğu Avrupa Kazı', breedPdfUrl: BS + 'Do%C4%9Fu%20Avrupa%20Kaz%C4%B1%20Standard.pdf', breedDate: '17.04.2019', colourPdfUrl: CS + 'Do%C4%9Fu%20Avrupa%20Kaz%C4%B1%20renklerin%20standard%C4%B1.pdf', colourDate: '17.04.2019' },
    { name: 'Eğri Gagalı Dövüş Kazı', breedPdfUrl: BS + 'E%C4%9Fri%20Gagal%C4%B1%20D%C3%B6v%C3%BC%C5%9F%20Kazlar%C4%B1.pdf', breedDate: '20.06.2025', colourPdfUrl: CS + 'E%C4%9Fri%20Gagal%C4%B1%20D%C3%B6v%C3%BC%C5%9F%20Kazlar%C4%B1%20Renk%20Standard.pdf', colourDate: '20.06.2025' },
    { name: 'Emden Kazı', breedPdfUrl: BS + 'Emden%20Kazi%20Standard.pdf', breedDate: '10.03.2020', colourPdfUrl: CS + 'Emden%20Kaz%C4%B1%20Renk%20Standard%C4%B1.pdf', colourDate: '07.12.2020' },
    { name: 'Kholmogori Kazı', breedPdfUrl: BS + 'Kholmogori%20Kaz%C4%B1%20Standard.pdf', breedDate: '17.04.2019', colourPdfUrl: CS + 'Kholmogori%20Kaz%C4%B1%20renklerin%20standard%C4%B1.pdf', colourDate: '24.02.2022' },
    { name: 'Steinbach Dövüşcü Kazı', breedPdfUrl: BS + 'Steinbach%20D%C3%B6v%C3%BC%C5%9Bc%C3%BC%20Kazi%20Irk%20Standard.pdf', breedDate: '03.12.2025', colourPdfUrl: CS + 'Steinbach%20D%C3%B6v%C3%BC%C5%9Fc%C3%BC%20kaz%C4%B1%20renk%20standard%C4%B1.pdf', colourDate: '03.12.2025' },
    { name: 'Toulouse Kazı', breedPdfUrl: BS + 'Tulus%20Kaz%C4%B1%20Standard.pdf', breedDate: '17.04.2019', colourPdfUrl: CS + 'Tulus%20Kaz%C4%B1%20Renk%20standard%C4%B1.pdf', colourDate: '28.12.2022' },
  ],
  ordek: [
    { name: 'Alman Campbell', breedPdfUrl: BS + 'EE%20Alman%20Campbell%20Standart.pdf', breedDate: '09.08.2019', colourPdfUrl: CS + 'Alman%20Campbell%20%C3%96rde%C4%9Fi%20renklerin%20standard%C4%B1.pdf', colourDate: '09.08.2019' },
    { name: 'Amerikan Pekin', breedPdfUrl: BS + 'EE%20Amerikan%20pekin%20standart.pdf', breedDate: '09.08.2019', colourPdfUrl: CS + 'Amerikan%20Pekin%20%C3%96rde%C4%9Fi%20renklerin%20standard%C4%B1.pdf', colourDate: '09.08.2019' },
    { name: 'Aylesbury', breedPdfUrl: BS + 'Aylesbury%20%C3%96rdek%20Standard.pdf', breedDate: '30.12.2021', colourPdfUrl: CS + 'Aylesbury%20%C3%96rdek%20Renk%20standard%C4%B1.pdf', colourDate: '30.12.2021' },
    { name: 'Cayuga', breedPdfUrl: BS + 'Cayuga%20%C3%96rde%C4%9Fi%20stanfard.pdf', breedDate: '09.08.2019', colourPdfUrl: CS + 'Cayuga%20%C3%96rde%C4%9Fi%20-%20Renklerin%20Standard%C4%B1.pdf', colourDate: '09.08.2019' },
    { name: 'Cüce (Dwarf) Ördek', breedPdfUrl: BS + 'EE%20C%C3%BCce%20%C3%96rdek%20Standard.pdf', breedDate: '28.12.2022' },
    { name: 'Dik Ördek', breedPdfUrl: BS + 'Dik%20%C3%96rde%C4%9Fi%20standart.pdf', breedDate: '09.08.2019', colourPdfUrl: CS + 'Dik%20%C3%96rde%C4%9Fi%20-%20Renklerin%20Standard%C4%B1.pdf', colourDate: '24.02.2023' },
    { name: 'Kırsal Ördek', breedPdfUrl: BS + 'Kirsal%20%C3%96rdek%20Standard.pdf', breedDate: '09.03.2020', colourPdfUrl: CS + 'K%C4%B1rsal%20%C3%96rdek%20Renk%20Standard%C4%B1.pdf', colourDate: '09.03.2020' },
    { name: 'Muscovy', breedPdfUrl: BS + 'Muscovy%20%C3%96rde%C4%9Fi%20standart.pdf', breedDate: '09.08.2019', colourPdfUrl: CS + 'Muscovy%20%C3%96rde%C4%9Fi%20-%20Renklerin%20Standard%C4%B1.pdf', colourDate: '13.08.2025' },
    { name: 'Rouen', breedPdfUrl: BS + 'Rouen%20%C3%96rde%C4%9Fi%20standart.pdf', breedDate: '09.08.2019', colourPdfUrl: CS + 'Rouen%20%C3%96rde%C4%9Fi%20-%20Renklerin%20Standard%C4%B1.pdf', colourDate: '28.12.2022' },
  ],
  hindi: [
    { name: 'Alman Hindisi', breedPdfUrl: BS + 'Alman%20Hindisi%20Irk%20Standardi.pdf', breedDate: '16.05.2024', colourPdfUrl: CS + 'Alman%20Hindisi%20renklerin%20standardi.pdf', colourDate: '09.07.2024' },
    { name: 'Alman Kırsal Hindisi', breedPdfUrl: BS + 'Alman%20K%C4%B1rsal%20Hindisi%20Irk%20Standardi.pdf', breedDate: '16.05.2024', colourPdfUrl: CS + 'Alman%20Kirsal%20Hindisi%20renklerin%20standardi.pdf', colourDate: '09.07.2024' },
    { name: 'Amerikan Bronz Hindisi', breedPdfUrl: BS + 'Amerikan%20bronz%20hindi.pdf', breedDate: '02.09.2020', colourPdfUrl: CS + 'Amerikan%20Bronz%20Hindi%20renklerin%20standard%C4%B1.pdf', colourDate: '02.09.2020' },
    { name: 'Amerikan Mavi Hindisi', breedPdfUrl: BS + 'Amerikan%20Mavi%20Hindi.pdf', breedDate: '02.09.2020', colourPdfUrl: CS + 'Amerikan%20Mavi%20Hindi%20Renklerin%20standard%C4%B1.pdf', colourDate: '02.09.2020' },
    { name: 'Narragansett Hindisi', breedPdfUrl: BS + 'Naragansett%20Hindisi%20Standard.pdf', breedDate: '02.11.2020', colourPdfUrl: CS + 'Narragansett%20Hindisi%20Renk%20Standard%C4%B1.pdf', colourDate: '14.09.2020' },
  ],
  bec: [
    { name: 'Beç Tavuğu', breedPdfUrl: BS + 'Be%C3%A7%20Tavugu%20Standard.pdf', breedDate: '07.12.2020', colourPdfUrl: CS + 'Bec%20Tavugu%20renk%20standardi.pdf', colourDate: '07.12.2020' },
  ],
  yerli: [
    { name: 'Denizli Pekmez Kefi', colourPdfUrl: CS + 'Denizli%20Pekmezkefi%20siyah%20g%C3%BCm%C3%BC%C5%9F%20turunc%20sirtli%20EE%20Taslak%20.pdf', colourDate: '18.11.2025', isDraft: true },
    { name: 'Gerze', breedPdfUrl: BS + 'Gerze%20Standardi%20taslak.pdf', breedDate: '18.11.2025', isDraft: true },
    { name: 'Trabzon Gugullusu', breedPdfUrl: BS + 'Trabzon%20Gugullusu%20EE%20Taslak.pdf', breedDate: '20.12.2025', isDraft: true },
    { name: 'Türk Asil', breedPdfUrl: BS + 'T%C3%BCrk%20Asil.pdf', breedDate: '18.11.2025', colourPdfUrl: CS + 'T%C3%BCrk%20Asil%20renk%20standardi.pdf', colourDate: '28.08.2026', isDraft: true },
  ],
}

async function main() {
  console.log('Seeding standartlar…')

  // Clear existing
  await prisma.standardImage.deleteMany()
  await prisma.standard.deleteMany()
  await prisma.standardCategory.deleteMany()

  let totalStandards = 0
  for (const cat of CATEGORIES) {
    const created = await prisma.standardCategory.create({ data: cat })
    const stds = STANDARDS[cat.slug] || []
    for (let i = 0; i < stds.length; i++) {
      const { isDraft = false, ...rest } = stds[i]
      await prisma.standard.create({
        data: { ...rest, categoryId: created.id, order: i, isDraft },
      })
      totalStandards++
    }
    console.log(`  ✓ ${cat.label}: ${stds.length} kayıt`)
  }

  console.log(`\nToplam: ${totalStandards} standart eklendi`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
