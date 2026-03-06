const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const pool = require('../config/database');

class AzureOpenAIService {
    constructor() {
        // Initialize only if Azure credentials are provided
        if (process.env.AZURE_OPENAI_ENDPOINT && process.env.AZURE_OPENAI_API_KEY) {
            this.client = new OpenAIClient(
                process.env.AZURE_OPENAI_ENDPOINT,
                new AzureKeyCredential(process.env.AZURE_OPENAI_API_KEY)
            );
            this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
            this.enabled = true;
        } else {
            this.enabled = false;
            console.warn('⚠️  Azure OpenAI not configured. Using fallback responses.');
        }
    }

    async getResponse(userMessage, language = 'am') {
        try {
            // Retrieve relevant context using traditional SQL search
            const context = await this.retrieveRelevantContext(userMessage, language);

            if (!this.enabled) {
                // Fallback response if Azure not configured
                return {
                    response: language === 'am'
                        ? `ይቅርታ፣ AI አገልግሎት አልተዋቀረም። እባክዎ የአዙር ቁልፎችን ያዋቅሩ።\n\nየተገኘ መረጃ: ${context.context.substring(0, 200)}...`
                        : `Sorry, AI service not configured. Please configure Azure keys.\n\nFound info: ${context.context.substring(0, 200)}...`,
                    confidence: 0.5,
                    sources: context.sources
                };
            }

            // Build system prompt with context
            const systemPrompt = this.buildSystemPrompt(language, context);

            // Get AI response from Azure OpenAI
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ];

            const result = await this.client.getChatCompletions(
                this.deploymentName,
                messages,
                {
                    temperature: 0.7,
                    maxTokens: 500,
                    topP: 0.95,
                    frequencyPenalty: 0,
                    presencePenalty: 0
                }
            );

            const response = result.choices[0].message.content;
            const confidence = this.calculateConfidence(result);

            return {
                response,
                confidence,
                sources: context.sources
            };
        } catch (error) {
            console.error('Azure OpenAI Service error:', error);
            return {
                response: language === 'am'
                    ? 'ይቅርታ፣ በአሁኑ ጊዜ መልስ መስጠት አልቻልኩም። እባክዎ ቆየት ብለው ይሞክሩ።'
                    : 'Sorry, I cannot provide a response at the moment. Please try again later.',
                confidence: 0,
                sources: []
            };
        }
    }

    async retrieveRelevantContext(userMessage, language) {
        try {
            const searchTerm = `%${userMessage.toLowerCase()}%`;

            // Search in FAQs using traditional SQL
            const faqColumn = language === 'am' ? 'question_am' : 'question_en';
            const answerColumn = language === 'am' ? 'answer_am' : 'answer_en';

            const faqResults = await pool.query(
                `SELECT ${faqColumn} as question, ${answerColumn} as answer
        FROM faqs 
        WHERE is_active = true 
        AND (LOWER(${faqColumn}) LIKE $1 OR LOWER(${answerColumn}) LIKE $1)
        ORDER BY priority DESC
        LIMIT 5`,
                [searchTerm]
            );

            // Get company info
            const infoColumn = language === 'am' ? 'content_am' : 'content_en';
            const titleColumn = language === 'am' ? 'title_am' : 'title_en';

            const companyInfo = await pool.query(
                `SELECT ${titleColumn} as title, ${infoColumn} as content 
         FROM company_info 
         WHERE is_active = true
         LIMIT 10`
            );

            // Combine context
            let context = '';
            const sources = [];

            if (faqResults.rows.length > 0) {
                context += language === 'am' ? 'የተደጋጋሚ ጥያቄዎች:\n' : 'FAQs:\n';
                faqResults.rows.forEach(faq => {
                    if (faq.question && faq.answer) {
                        context += `Q: ${faq.question}\nA: ${faq.answer}\n\n`;
                        sources.push({ type: 'FAQ' });
                    }
                });
            }

            if (companyInfo.rows.length > 0) {
                context += language === 'am' ? 'የኩባንያ መረጃ:\n' : 'Company Information:\n';
                companyInfo.rows.forEach(info => {
                    if (info.title && info.content) {
                        context += `${info.title}: ${info.content}\n\n`;
                        sources.push({ type: 'Company Info' });
                    }
                });
            }

            return { context, sources };
        } catch (error) {
            console.error('Context retrieval error:', error);
            return { context: '', sources: [] };
        }
    }

    buildSystemPrompt(language, contextData) {
        const basePrompt = language === 'am'
            ? `አንተ የኩባንያ AI ረዳት ነህ። የሚከተለውን መረጃ በመጠቀም ጥያቄዎችን በአማርኛ መልስ።

ህጎች:
- ከተሰጠው መረጃ ውጭ መልስ አትስጥ
- ባለማወቅ መረጃ አትፍጠር
- ሙያዊ እና ግልጽ መልስ ስጥ
- የማታውቀውን ነገር ከሆነ ለሰው ድጋፍ አቅጣጫ ስጥ
- ሁልጊዜ በአማርኛ መልስ ስጥ

የኩባንያ መረጃ:
${contextData.context || 'ምንም መረጃ አልተገኘም።'}`
            : `You are a company AI assistant. Answer questions using the following information in English.

Rules:
- Only respond based on provided information
- Do not generate unsupported information
- Provide professional and clear responses
- If you don't know, direct to human support
- Always respond in English

Company Information:
${contextData.context || 'No information found.'}`;

        return basePrompt;
    }

    calculateConfidence(result) {
        const finishReason = result.choices[0].finishReason;
        if (finishReason === 'stop') {
            return 0.85;
        }
        return 0.60;
    }
}

module.exports = new AzureOpenAIService();
