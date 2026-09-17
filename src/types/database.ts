export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          aksi: string
          created_at: string
          detail: Json | null
          id: number
          user_id: string
        }
        Insert: {
          aksi: string
          created_at?: string
          detail?: Json | null
          id?: number
          user_id: string
        }
        Update: {
          aksi?: string
          created_at?: string
          detail?: Json | null
          id?: number
          user_id?: string
        }
        Relationships: []
      }
      batch_benefits: {
        Row: {
          batch_id: number
          id: number
          ikon: string | null
          teks_en: string | null
          teks_id: string
          urutan: number
        }
        Insert: {
          batch_id: number
          id?: number
          ikon?: string | null
          teks_en?: string | null
          teks_id: string
          urutan?: number
        }
        Update: {
          batch_id?: number
          id?: number
          ikon?: string | null
          teks_en?: string | null
          teks_id?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_benefits_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          nama_en: string | null
          nama_id: string
          updated_at: string
          urutan: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama_en?: string | null
          nama_id: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama_en?: string | null
          nama_id?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      batch_equipment: {
        Row: {
          batch_id: number
          id: number
          teks_en: string | null
          teks_id: string
          urutan: number
        }
        Insert: {
          batch_id: number
          id?: number
          teks_en?: string | null
          teks_id: string
          urutan?: number
        }
        Update: {
          batch_id?: number
          id?: number
          teks_en?: string | null
          teks_id?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_equipment_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_faqs: {
        Row: {
          batch_id: number
          id: number
          jawab_en: string | null
          jawab_id: string
          tanya_en: string | null
          tanya_id: string
          urutan: number
        }
        Insert: {
          batch_id: number
          id?: number
          jawab_en?: string | null
          jawab_id: string
          tanya_en?: string | null
          tanya_id: string
          urutan?: number
        }
        Update: {
          batch_id?: number
          id?: number
          jawab_en?: string | null
          jawab_id?: string
          tanya_en?: string | null
          tanya_id?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_faqs_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_gallery: {
        Row: {
          batch_id: number
          caption_en: string | null
          caption_id: string | null
          gambar_url: string
          id: number
          urutan: number
        }
        Insert: {
          batch_id: number
          caption_en?: string | null
          caption_id?: string | null
          gambar_url: string
          id?: number
          urutan?: number
        }
        Update: {
          batch_id?: number
          caption_en?: string | null
          caption_id?: string | null
          gambar_url?: string
          id?: number
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_gallery_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_leads: {
        Row: {
          batch_id: number | null
          catatan: string | null
          consent_at: string
          created_at: string
          email: string | null
          id: number
          nama: string
          status: Database["public"]["Enums"]["status_lead"]
          whatsapp: string
        }
        Insert: {
          batch_id?: number | null
          catatan?: string | null
          consent_at: string
          created_at?: string
          email?: string | null
          id?: number
          nama: string
          status?: Database["public"]["Enums"]["status_lead"]
          whatsapp: string
        }
        Update: {
          batch_id?: number | null
          catatan?: string | null
          consent_at?: string
          created_at?: string
          email?: string | null
          id?: number
          nama?: string
          status?: Database["public"]["Enums"]["status_lead"]
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "batch_leads_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_registrations: {
        Row: {
          alamat_lengkap: string | null
          alasan_tolak: string | null
          batch_id: number
          created_at: string
          email: string | null
          foto_ktp_url: string | null
          id: number
          kategori_peserta: Database["public"]["Enums"]["kategori_peserta_rpc"]
          kode_referral: string | null
          nama_lengkap: string | null
          nomor_ktp: string | null
          pas_foto_url: string | null
          status: Database["public"]["Enums"]["status_registrasi_batch"]
          sumber_info: string | null
          tanggal_lahir: string | null
          tempat_lahir: string | null
          updated_at: string
          user_id: string | null
          verified_at: string | null
          verified_by: string | null
          whatsapp: string | null
        }
        Insert: {
          alamat_lengkap?: string | null
          alasan_tolak?: string | null
          batch_id: number
          created_at?: string
          email?: string | null
          foto_ktp_url?: string | null
          id?: number
          kategori_peserta: Database["public"]["Enums"]["kategori_peserta_rpc"]
          kode_referral?: string | null
          nama_lengkap?: string | null
          nomor_ktp?: string | null
          pas_foto_url?: string | null
          status?: Database["public"]["Enums"]["status_registrasi_batch"]
          sumber_info?: string | null
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          whatsapp?: string | null
        }
        Update: {
          alamat_lengkap?: string | null
          alasan_tolak?: string | null
          batch_id?: number
          created_at?: string
          email?: string | null
          foto_ktp_url?: string | null
          id?: number
          kategori_peserta?: Database["public"]["Enums"]["kategori_peserta_rpc"]
          kode_referral?: string | null
          nama_lengkap?: string | null
          nomor_ktp?: string | null
          pas_foto_url?: string | null
          status?: Database["public"]["Enums"]["status_registrasi_batch"]
          sumber_info?: string | null
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
          verified_by?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batch_registrations_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batch_requirements: {
        Row: {
          batch_id: number
          id: number
          ikon: string | null
          teks_en: string | null
          teks_id: string
          urutan: number
        }
        Insert: {
          batch_id: number
          id?: number
          ikon?: string | null
          teks_en?: string | null
          teks_id: string
          urutan?: number
        }
        Update: {
          batch_id?: number
          id?: number
          ikon?: string | null
          teks_en?: string | null
          teks_id?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "batch_requirements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          alamat: string | null
          category_id: string | null
          created_at: string
          deskripsi_en: string | null
          deskripsi_id: string | null
          gambar_detail_url: string | null
          harga: number | null
          hero_gambar_url: string | null
          id: number
          is_active: boolean
          judul_en: string | null
          judul_id: string
          kategori_en: string | null
          kategori_id: string | null
          lokasi_en: string | null
          lokasi_id: string | null
          rating: number | null
          silabus_en: string | null
          silabus_id: string | null
          slug: string
          status: Database["public"]["Enums"]["status_batch"]
          tanggal_mulai: string | null
          tanggal_selesai: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          alamat?: string | null
          category_id?: string | null
          created_at?: string
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          gambar_detail_url?: string | null
          harga?: number | null
          hero_gambar_url?: string | null
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id: string
          kategori_en?: string | null
          kategori_id?: string | null
          lokasi_en?: string | null
          lokasi_id?: string | null
          rating?: number | null
          silabus_en?: string | null
          silabus_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["status_batch"]
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          alamat?: string | null
          category_id?: string | null
          created_at?: string
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          gambar_detail_url?: string | null
          harga?: number | null
          hero_gambar_url?: string | null
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id?: string
          kategori_en?: string | null
          kategori_id?: string | null
          lokasi_en?: string | null
          lokasi_id?: string | null
          rating?: number | null
          silabus_en?: string | null
          silabus_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["status_batch"]
          tanggal_mulai?: string | null
          tanggal_selesai?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "batches_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "batch_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_counters: {
        Row: {
          jenis: Database["public"]["Enums"]["jenis_sertifikat"]
          last_number: number
        }
        Insert: {
          jenis: Database["public"]["Enums"]["jenis_sertifikat"]
          last_number?: number
        }
        Update: {
          jenis?: Database["public"]["Enums"]["jenis_sertifikat"]
          last_number?: number
        }
        Relationships: []
      }
      certificate_orders: {
        Row: {
          alamat_pengiriman: Json | null
          alasan_tolak: string | null
          bukti_url: string | null
          catatan_kirim: string | null
          created_at: string
          id: number
          nominal: number
          paket: Database["public"]["Enums"]["paket_upgrade"]
          status: Database["public"]["Enums"]["status_order"]
          status_pengiriman: Database["public"]["Enums"]["status_kirim"]
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          alamat_pengiriman?: Json | null
          alasan_tolak?: string | null
          bukti_url?: string | null
          catatan_kirim?: string | null
          created_at?: string
          id?: number
          nominal: number
          paket: Database["public"]["Enums"]["paket_upgrade"]
          status?: Database["public"]["Enums"]["status_order"]
          status_pengiriman?: Database["public"]["Enums"]["status_kirim"]
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          alamat_pengiriman?: Json | null
          alasan_tolak?: string | null
          bukti_url?: string | null
          catatan_kirim?: string | null
          created_at?: string
          id?: number
          nominal?: number
          paket?: Database["public"]["Enums"]["paket_upgrade"]
          status?: Database["public"]["Enums"]["status_order"]
          status_pengiriman?: Database["public"]["Enums"]["status_kirim"]
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          jenis: Database["public"]["Enums"]["jenis_sertifikat"]
          nama_lengkap: string
          nomor_sertifikat: string
          public_token: string
          qr_aktif: boolean
          tanggal_kedaluwarsa: string | null
          tanggal_terbit: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          jenis: Database["public"]["Enums"]["jenis_sertifikat"]
          nama_lengkap: string
          nomor_sertifikat: string
          public_token?: string
          qr_aktif?: boolean
          tanggal_kedaluwarsa?: string | null
          tanggal_terbit: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          jenis?: Database["public"]["Enums"]["jenis_sertifikat"]
          nama_lengkap?: string
          nomor_sertifikat?: string
          public_token?: string
          qr_aktif?: boolean
          tanggal_kedaluwarsa?: string | null
          tanggal_terbit?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      company_profile: {
        Row: {
          gambar_url: string | null
          id: number
          judul_en: string | null
          judul_id: string
          konten_en: string | null
          konten_id: string
          updated_at: string
        }
        Insert: {
          gambar_url?: string | null
          id?: number
          judul_en?: string | null
          judul_id?: string
          konten_en?: string | null
          konten_id?: string
          updated_at?: string
        }
        Update: {
          gambar_url?: string | null
          id?: number
          judul_en?: string | null
          judul_id?: string
          konten_en?: string | null
          konten_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          cta_teks_en: string | null
          cta_teks_id: string | null
          cta_url: string | null
          gambar_url: string | null
          id: number
          is_active: boolean
          judul_en: string | null
          judul_id: string
          subjudul_en: string | null
          subjudul_id: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          cta_teks_en?: string | null
          cta_teks_id?: string | null
          cta_url?: string | null
          gambar_url?: string | null
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id: string
          subjudul_en?: string | null
          subjudul_id?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          cta_teks_en?: string | null
          cta_teks_id?: string | null
          cta_url?: string | null
          gambar_url?: string | null
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id?: string
          subjudul_en?: string | null
          subjudul_id?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      instructors: {
        Row: {
          bio_en: string | null
          bio_id: string | null
          foto_url: string | null
          id: number
          is_active: boolean
          jabatan_en: string | null
          jabatan_id: string | null
          nama: string
          updated_at: string
          urutan: number
        }
        Insert: {
          bio_en?: string | null
          bio_id?: string | null
          foto_url?: string | null
          id?: number
          is_active?: boolean
          jabatan_en?: string | null
          jabatan_id?: string | null
          nama: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          bio_en?: string | null
          bio_id?: string | null
          foto_url?: string | null
          id?: number
          is_active?: boolean
          jabatan_en?: string | null
          jabatan_id?: string | null
          nama?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      material_chapter_files: {
        Row: {
          chapter_id: number
          created_at: string
          deskripsi_en: string | null
          deskripsi_id: string | null
          id: number
          judul_en: string | null
          judul_id: string
          updated_at: string
          url_file: string
          urutan: number
        }
        Insert: {
          chapter_id: number
          created_at?: string
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          id?: never
          judul_en?: string | null
          judul_id: string
          updated_at?: string
          url_file: string
          urutan?: number
        }
        Update: {
          chapter_id?: number
          created_at?: string
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          id?: never
          judul_en?: string | null
          judul_id?: string
          updated_at?: string
          url_file?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "material_chapter_files_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "material_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      material_chapters: {
        Row: {
          created_at: string
          gambar_url: string | null
          id: number
          judul_en: string | null
          judul_id: string
          konten_en: string | null
          konten_id: string
          material_id: number
          updated_at: string
          urutan: number
          video_url: string | null
        }
        Insert: {
          created_at?: string
          gambar_url?: string | null
          id?: never
          judul_en?: string | null
          judul_id: string
          konten_en?: string | null
          konten_id: string
          material_id: number
          updated_at?: string
          urutan?: number
          video_url?: string | null
        }
        Update: {
          created_at?: string
          gambar_url?: string | null
          id?: never
          judul_en?: string | null
          judul_id?: string
          konten_en?: string | null
          konten_id?: string
          material_id?: number
          updated_at?: string
          urutan?: number
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_chapters_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_progress: {
        Row: {
          chapter_id: number
          created_at: string
          id: number
          is_selesai: boolean
          selesai_at: string | null
          user_id: string
        }
        Insert: {
          chapter_id: number
          created_at?: string
          id?: never
          is_selesai?: boolean
          selesai_at?: string | null
          user_id: string
        }
        Update: {
          chapter_id?: number
          created_at?: string
          id?: never
          is_selesai?: boolean
          selesai_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_progress_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "material_chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          deskripsi_en: string | null
          deskripsi_id: string | null
          file_url: string
          id: number
          is_active: boolean
          judul_en: string | null
          judul_id: string
          poster_url: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          file_url: string
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id: string
          poster_url?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          file_url?: string
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id?: string
          poster_url?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      popups: {
        Row: {
          created_at: string
          cta_teks_en: string | null
          cta_teks_id: string | null
          cta_url: string | null
          gambar_desktop_url: string | null
          gambar_mobile_url: string | null
          gambar_url: string | null
          id: number
          is_active: boolean
          isi_en: string | null
          isi_id: string
          judul_en: string | null
          judul_id: string
          tayang_mulai: string | null
          tayang_selesai: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_teks_en?: string | null
          cta_teks_id?: string | null
          cta_url?: string | null
          gambar_desktop_url?: string | null
          gambar_mobile_url?: string | null
          gambar_url?: string | null
          id?: number
          is_active?: boolean
          isi_en?: string | null
          isi_id: string
          judul_en?: string | null
          judul_id: string
          tayang_mulai?: string | null
          tayang_selesai?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_teks_en?: string | null
          cta_teks_id?: string | null
          cta_url?: string | null
          gambar_desktop_url?: string | null
          gambar_mobile_url?: string | null
          gambar_url?: string | null
          id?: number
          is_active?: boolean
          isi_en?: string | null
          isi_id?: string
          judul_en?: string | null
          judul_id?: string
          tayang_mulai?: string | null
          tayang_selesai?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          nama_en: string | null
          nama_id: string
          updated_at: string
          urutan: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama_en?: string | null
          nama_id: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          nama_en?: string | null
          nama_id?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      product_images: {
        Row: {
          id: number
          product_id: number
          url: string
          urutan: number
        }
        Insert: {
          id?: number
          product_id: number
          url: string
          urutan?: number
        }
        Update: {
          id?: number
          product_id?: number
          url?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          created_at: string
          deskripsi_en: string | null
          deskripsi_id: string | null
          harga: number | null
          id: number
          is_active: boolean
          kategori: string | null
          nama_en: string | null
          nama_id: string
          rating: number | null
          slug: string
          spesifikasi_en: string | null
          spesifikasi_id: string | null
          tampilkan_harga: boolean
          thumbnail_url: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          harga?: number | null
          id?: number
          is_active?: boolean
          kategori?: string | null
          nama_en?: string | null
          nama_id: string
          rating?: number | null
          slug: string
          spesifikasi_en?: string | null
          spesifikasi_id?: string | null
          tampilkan_harga?: boolean
          thumbnail_url?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          harga?: number | null
          id?: number
          is_active?: boolean
          kategori?: string | null
          nama_en?: string | null
          nama_id?: string
          rating?: number | null
          slug?: string
          spesifikasi_en?: string | null
          spesifikasi_id?: string | null
          tampilkan_harga?: boolean
          thumbnail_url?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          alamat_lengkap: string | null
          created_at: string
          foto_ktp_url: string | null
          free_track_selesai_at: string | null
          id: string
          nama_lengkap: string
          nomor_ktp: string | null
          pas_foto_url: string | null
          role: string
          tanggal_lahir: string | null
          tempat_lahir: string | null
          whatsapp: string | null
        }
        Insert: {
          alamat_lengkap?: string | null
          created_at?: string
          foto_ktp_url?: string | null
          free_track_selesai_at?: string | null
          id: string
          nama_lengkap?: string
          nomor_ktp?: string | null
          pas_foto_url?: string | null
          role?: string
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          whatsapp?: string | null
        }
        Update: {
          alamat_lengkap?: string | null
          created_at?: string
          foto_ktp_url?: string | null
          free_track_selesai_at?: string | null
          id?: string
          nama_lengkap?: string
          nomor_ktp?: string | null
          pas_foto_url?: string | null
          role?: string
          tanggal_lahir?: string | null
          tempat_lahir?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      quiz_options: {
        Row: {
          id: number
          is_correct: boolean
          label_en: string | null
          label_id: string
          penjelasan_en: string | null
          penjelasan_id: string | null
          question_id: number
          urutan: number
        }
        Insert: {
          id?: number
          is_correct?: boolean
          label_en?: string | null
          label_id: string
          penjelasan_en?: string | null
          penjelasan_id?: string | null
          question_id: number
          urutan?: number
        }
        Update: {
          id?: number
          is_correct?: boolean
          label_en?: string | null
          label_id?: string
          penjelasan_en?: string | null
          penjelasan_id?: string | null
          question_id?: number
          urutan?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          id: number
          is_active: boolean
          pertanyaan_en: string | null
          pertanyaan_id: string
          updated_at: string
          urutan: number
        }
        Insert: {
          id?: number
          is_active?: boolean
          pertanyaan_en?: string | null
          pertanyaan_id: string
          updated_at?: string
          urutan?: number
        }
        Update: {
          id?: number
          is_active?: boolean
          pertanyaan_en?: string | null
          pertanyaan_id?: string
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          consent_at: string
          created_at: string
          email: string
          id: number
          kebutuhan: string | null
          nama: string
          perusahaan: string | null
          product_id: number | null
          status: Database["public"]["Enums"]["status_lead"]
          whatsapp: string | null
        }
        Insert: {
          consent_at: string
          created_at?: string
          email: string
          id?: number
          kebutuhan?: string | null
          nama: string
          perusahaan?: string | null
          product_id?: number | null
          status?: Database["public"]["Enums"]["status_lead"]
          whatsapp?: string | null
        }
        Update: {
          consent_at?: string
          created_at?: string
          email?: string
          id?: number
          kebutuhan?: string | null
          nama?: string
          perusahaan?: string | null
          product_id?: number | null
          status?: Database["public"]["Enums"]["status_lead"]
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_public"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_banners: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          judul_en: string | null
          judul_id: string
          tayang_mulai: string | null
          tayang_selesai: string | null
          teks_en: string | null
          teks_id: string | null
          tombol_teks_en: string | null
          tombol_teks_id: string | null
          tombol_url: string | null
          updated_at: string
          urgensi_en: string | null
          urgensi_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id: string
          tayang_mulai?: string | null
          tayang_selesai?: string | null
          teks_en?: string | null
          teks_id?: string | null
          tombol_teks_en?: string | null
          tombol_teks_id?: string | null
          tombol_url?: string | null
          updated_at?: string
          urgensi_en?: string | null
          urgensi_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          judul_en?: string | null
          judul_id?: string
          tayang_mulai?: string | null
          tayang_selesai?: string | null
          teks_en?: string | null
          teks_id?: string | null
          tombol_teks_en?: string | null
          tombol_teks_id?: string | null
          tombol_url?: string | null
          updated_at?: string
          urgensi_en?: string | null
          urgensi_id?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          foto_url: string | null
          id: number
          is_active: boolean
          isi_en: string | null
          isi_id: string
          nama: string
          peran_en: string | null
          peran_id: string | null
          updated_at: string
          urutan: number
        }
        Insert: {
          foto_url?: string | null
          id?: number
          is_active?: boolean
          isi_en?: string | null
          isi_id: string
          nama: string
          peran_en?: string | null
          peran_id?: string | null
          updated_at?: string
          urutan?: number
        }
        Update: {
          foto_url?: string | null
          id?: number
          is_active?: boolean
          isi_en?: string | null
          isi_id?: string
          nama?: string
          peran_en?: string | null
          peran_id?: string | null
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
    }
    Views: {
      certificates_public: {
        Row: {
          jenis: Database["public"]["Enums"]["jenis_sertifikat"] | null
          nama_lengkap: string | null
          nomor_sertifikat: string | null
          public_token: string | null
          status: string | null
          tanggal_kedaluwarsa: string | null
          tanggal_terbit: string | null
        }
        Insert: {
          jenis?: Database["public"]["Enums"]["jenis_sertifikat"] | null
          nama_lengkap?: string | null
          nomor_sertifikat?: string | null
          public_token?: string | null
          status?: never
          tanggal_kedaluwarsa?: string | null
          tanggal_terbit?: string | null
        }
        Update: {
          jenis?: Database["public"]["Enums"]["jenis_sertifikat"] | null
          nama_lengkap?: string | null
          nomor_sertifikat?: string | null
          public_token?: string | null
          status?: never
          tanggal_kedaluwarsa?: string | null
          tanggal_terbit?: string | null
        }
        Relationships: []
      }
      products_public: {
        Row: {
          category_id: string | null
          created_at: string | null
          deskripsi_en: string | null
          deskripsi_id: string | null
          harga: number | null
          id: number | null
          kategori: string | null
          nama_en: string | null
          nama_id: string | null
          rating: number | null
          slug: string | null
          spesifikasi_en: string | null
          spesifikasi_id: string | null
          tampilkan_harga: boolean | null
          thumbnail_url: string | null
          urutan: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          harga?: never
          id?: number | null
          kategori?: string | null
          nama_en?: string | null
          nama_id?: string | null
          rating?: number | null
          slug?: string | null
          spesifikasi_en?: string | null
          spesifikasi_id?: string | null
          tampilkan_harga?: boolean | null
          thumbnail_url?: string | null
          urutan?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          deskripsi_en?: string | null
          deskripsi_id?: string | null
          harga?: never
          id?: number | null
          kategori?: string | null
          nama_en?: string | null
          nama_id?: string | null
          rating?: number | null
          slug?: string | null
          spesifikasi_en?: string | null
          spesifikasi_id?: string | null
          tampilkan_harga?: boolean | null
          thumbnail_url?: string | null
          urutan?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      aktivasi_sertifikat_free_track: {
        Args: { p_order_id: number }
        Returns: {
          certificate_id: string
          nomor_sertifikat: string
          user_id: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      next_certificate_number: {
        Args: { p_jenis: Database["public"]["Enums"]["jenis_sertifikat"] }
        Returns: string
      }
      profil_identitas_lengkap: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      reorder_batch_categories: {
        Args: { p_category_ids: string[] }
        Returns: undefined
      }
      reorder_material_chapter_files: {
        Args: { p_chapter_id: number; p_file_ids: number[] }
        Returns: undefined
      }
      reorder_material_chapters: {
        Args: { p_chapter_ids: number[]; p_material_id: number }
        Returns: undefined
      }
      reorder_product_categories: {
        Args: { p_category_ids: string[] }
        Returns: undefined
      }
      reorder_quiz_questions: {
        Args: { p_question_ids: number[] }
        Returns: undefined
      }
      status_sertifikat: { Args: { p_exp: string }; Returns: string }
    }
    Enums: {
      jenis_sertifikat: "free_track" | "existing_manual" | "rpc_certified"
      kategori_peserta_rpc: "penerbitan_baru" | "perpanjangan_renewal"
      paket_upgrade: "cert_only" | "cert_merch" | "merch_addon"
      status_batch: "upcoming" | "open" | "closed"
      status_kirim:
        | "tidak_ada"
        | "belum_diproses"
        | "diproses"
        | "dikirim"
        | "diterima"
      status_lead: "baru" | "dihubungi" | "selesai"
      status_order:
        | "menunggu_bukti"
        | "menunggu_verifikasi"
        | "disetujui"
        | "ditolak"
      status_registrasi_batch: "menunggu_verifikasi" | "disetujui" | "ditolak"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      jenis_sertifikat: ["free_track", "existing_manual", "rpc_certified"],
      kategori_peserta_rpc: ["penerbitan_baru", "perpanjangan_renewal"],
      paket_upgrade: ["cert_only", "cert_merch", "merch_addon"],
      status_batch: ["upcoming", "open", "closed"],
      status_kirim: [
        "tidak_ada",
        "belum_diproses",
        "diproses",
        "dikirim",
        "diterima",
      ],
      status_lead: ["baru", "dihubungi", "selesai"],
      status_order: [
        "menunggu_bukti",
        "menunggu_verifikasi",
        "disetujui",
        "ditolak",
      ],
      status_registrasi_batch: ["menunggu_verifikasi", "disetujui", "ditolak"],
    },
  },
} as const
