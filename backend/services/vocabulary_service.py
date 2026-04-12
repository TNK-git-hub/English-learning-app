"""
Vocabulary Service — Business logic cho Vocabulary.
"""
from repositories import vocabulary_repository
from utils.exceptions import NotFoundException, ConflictException


def get_user_vocab(user_id: int, conn):
    """Lấy danh sách từ vựng của user."""
    vocabs = vocabulary_repository.find_by_user(conn, user_id)

    for vocab in vocabs:
        if vocab.get("created_at"):
            vocab["created_at"] = vocab["created_at"].isoformat()

    return {"success": True, "data": vocabs, "total": len(vocabs)}


def save_word(user_id: int, word: str, article_id: str, conn):
    """Lưu từ vựng mới cho user."""
    # Kiểm tra duplicate
    if vocabulary_repository.check_duplicate(conn, user_id, word):
        raise ConflictException(f"Word '{word}' already saved.")

    vocab_id = vocabulary_repository.create(conn, user_id, word, article_id)
    return {"success": True, "message": "Word saved", "id": vocab_id}


def delete_word(vocab_id: str, user_id: int, conn):
    """Xóa từ vựng (chỉ owner)."""
    deleted = vocabulary_repository.delete(conn, vocab_id, user_id)
    if not deleted:
        raise NotFoundException("Vocabulary not found or you don't have permission.")
    return {"success": True, "message": "Word deleted"}
