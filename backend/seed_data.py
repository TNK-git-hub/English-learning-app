"""
Script tạo dữ liệu mẫu cho database LearnUp.
Chạy: python seed_data.py
"""
import mysql.connector
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", 3306)),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "12345"),
    "database": os.getenv("DB_NAME", "LearnUp"),
    "charset": "utf8mb4",
}


def seed():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:
        # ===== 1. Tạo Tags =====
        tags = ["Sport", "Business", "Culture", "Science", "Lifestyle", "Technology"]
        cursor.execute("DELETE FROM article_tags")
        cursor.execute("DELETE FROM vocabularies")
        cursor.execute("DELETE FROM articles")
        cursor.execute("DELETE FROM tags")
        conn.commit()

        for tag_name in tags:
            cursor.execute("INSERT INTO tags (name) VALUES (%s)", (tag_name,))
        conn.commit()

        # Lấy lại tag IDs
        cursor.execute("SELECT id, name FROM tags")
        tag_map = {name: tid for tid, name in cursor.fetchall()}

        # ===== 2. Tạo Articles =====
        articles = [
            {
                "title": "O I I: another hamstring injury",
                "content": "Reece James has suffered the 10th hamstring injury of his career. The Chelsea defender is expected to be out for several months. This continuous string of injuries has raised questions about his long-term career prospects at the highest level of football.",
                "image_url": "https://images.unsplash.com/photo-1600250644078-d50d03bfa8dc?w=500&q=80",
                "tags": ["Sport"],
            },
            {
                "title": "Laporta after Barcelona re-election",
                "content": "Joan Laporta said the door is always open for Lionel Messi to return to Barcelona. After winning the re-election as club president, Laporta outlined his vision for the future of the club, emphasizing youth development and financial stability.",
                "image_url": "https://images.unsplash.com/photo-1508344928928-7165b67de128?w=500&q=80",
                "tags": ["Sport"],
            },
            {
                "title": "Manchester City need 'perfect game' to get past Real Madrid",
                "content": "Pep Guardiola believes Manchester City must play the 'perfect game' to eliminate Real Madrid from the Champions League. The tactical battle between two of Europe's elite coaches promises to be one of the most compelling matchups this season.",
                "image_url": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&q=80",
                "tags": ["Sport"],
            },
            {
                "title": "The Future of Remote Work in 2026",
                "content": "As companies continue to adapt to hybrid work models, new studies show that remote workers report higher productivity levels. However, challenges around collaboration and company culture remain significant concerns for business leaders worldwide.",
                "image_url": "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=500&q=80",
                "tags": ["Business", "Lifestyle"],
            },
            {
                "title": "AI Revolution: How Machine Learning is Changing Healthcare",
                "content": "Artificial intelligence is transforming the healthcare industry, from early disease detection to personalized treatment plans. Researchers have developed new algorithms that can predict patient outcomes with unprecedented accuracy, potentially saving millions of lives.",
                "image_url": "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&q=80",
                "tags": ["Science", "Technology"],
            },
            {
                "title": "Japanese Tea Ceremony: A Window into Traditional Culture",
                "content": "The Japanese tea ceremony, known as 'chanoyu', is much more than just drinking tea. It represents harmony, respect, purity, and tranquility. This ancient practice continues to influence modern Japanese culture and has gained appreciation worldwide.",
                "image_url": "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=500&q=80",
                "tags": ["Culture", "Lifestyle"],
            },
        ]

        for article in articles:
            article_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO articles (id, title, content, image_url) VALUES (%s, %s, %s, %s)",
                (article_id, article["title"], article["content"], article["image_url"]),
            )
            # Gắn tags
            for tag_name in article["tags"]:
                tag_id = tag_map.get(tag_name)
                if tag_id:
                    cursor.execute(
                        "INSERT INTO article_tags (article_id, tag_id) VALUES (%s, %s)",
                        (article_id, tag_id),
                    )

        conn.commit()
        print(f"✅ Seed thành công! Đã tạo {len(tags)} tags và {len(articles)} articles.")

    except Exception as e:
        conn.rollback()
        print(f"❌ Lỗi: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    seed()
