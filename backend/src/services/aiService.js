const Groq = require('groq-sdk');
const pool = require('../config/database');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || 'dummy-key'
});

class AIService {
    async getResponse(userMessage, language = 'am') {
        try {
            // Get knowledge base context
            const context = await this.getKnowledgeContext(userMessage, language);

            // Build system prompt
            const systemPrompt = this.buildSystemPrompt(language, context);

            // Get AI response using Groq (Free API with Llama 3)
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile', // Free model with excellent multilingual support
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            });

            const response = completion.choices[0].message.content;
            const confidence = this.calculateConfidence(completion);

            return {
                response,
                confidence
            };
        } catch (error) {
            console.error('AI Service error:', error);
            return {
                response: language === 'am'
                    ? 'ይቅርታ፣ በአሁኑ ጊዜ መልስ መስጠት አልቻልኩም። እባክዎ ቆየት ብለው ይሞክሩ።'
                    : 'Sorry, I cannot provide a response at the moment. Please try again later.',
                confidence: 0
            };
        }
    }

    async getKnowledgeContext(userMessage, language) {
        try {
            // Get relevant FAQs
            const faqColumn = language === 'am' ? 'answer_am' : 'answer_en';
            const questionColumn = language === 'am' ? 'question_am' : 'question_en';

            const faqs = await pool.query(
                `SELECT ${questionColumn} as question, ${faqColumn} as answer 
         FROM faqs 
         WHERE is_active = true 
         ORDER BY priority DESC 
         LIMIT 10`
            );

            // Get company info
            const companyInfo = await pool.query(
                `SELECT title_${language} as title, content_${language} as content 
         FROM company_info 
         WHERE is_active = true`
            );

            let context = 'Company Information:\n';
            companyInfo.rows.forEach(info => {
                context += `${info.title}: ${info.content}\n`;
            });

            context += '\nFrequently Asked Questions:\n';
            faqs.rows.forEach(faq => {
                context += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
            });

            return context;
        } catch (error) {
            console.error('Get knowledge context error:', error);
            return '';
        }
    }

    buildSystemPrompt(language, context) {
        const basePrompt = language === 'am'
            ? `አንت የኩባንያ AI ረዳት ነህ። የሚከተለውን መረጃ በመጠቀም ጥያቄዎችን መልስ።
         
ህጎች:
- ከተሰጠው መረጃ ውጭ መልስ አትስጥ
- ባለማወቅ መረጃ አትፍጠር
- ሙያዊ እና ግልጽ መልስ ስጥ
- የማታውቀውን ነገር ከሆነ ለሰው ድጋፍ አቅጣጫ ስጥ

የኩባንያ መረጃ:
${context}`
            : `You are a company AI assistant. Answer questions using the following information.

Rules:
- Only respond based on provided information
- Do not generate unsupported information
- Provide professional and clear responses
- If you don't know, direct to human support

Company Information:
${context}`;

        return basePrompt;
    }

    calculateConfidence(completion) {
        // Simple confidence calculation based on response
        // In production, use more sophisticated methods
        const finishReason = completion.choices[0].finish_reason;
        if (finishReason === 'stop') {
            return 0.85;
        }
        return 0.60;
    }
}

module.exports = new AIService();
