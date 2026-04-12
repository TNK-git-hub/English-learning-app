/**
 * Vocabulary Service — API calls cho từ vựng
 * [MỚI] Chưa có API backend, sẽ implement sau
 */

/**
 * Lấy danh sách từ vựng đã lưu
 * @returns {Promise<Array>}
 */
async function fetchVocabularyAPI() {
    // TODO: Implement khi có backend API
    return [];
}

/**
 * Lưu từ vựng mới
 * @param {object} wordData - { word, meaning, example, pronunciation }
 * @returns {Promise<object>}
 */
async function saveVocabularyAPI(wordData) {
    // TODO: Implement khi có backend API
    return wordData;
}

/**
 * Xóa từ vựng
 * @param {number} vocabId
 * @returns {Promise<void>}
 */
async function deleteVocabularyAPI(vocabId) {
    // TODO: Implement khi có backend API
}
