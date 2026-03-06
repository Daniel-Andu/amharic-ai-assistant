const sdk = require('microsoft-cognitiveservices-speech-sdk');

class AzureSpeechService {
    constructor() {
        // Only initialize if Azure Speech credentials are provided
        if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
            this.speechConfig = sdk.SpeechConfig.fromSubscription(
                process.env.AZURE_SPEECH_KEY,
                process.env.AZURE_SPEECH_REGION
            );

            this.speechConfig.speechRecognitionLanguage = process.env.AZURE_SPEECH_LANGUAGE || 'am-ET';
            this.speechConfig.speechSynthesisVoiceName = 'am-ET-MekdesNeural';
            this.enabled = true;
        } else {
            this.enabled = false;
            console.warn('⚠️  Azure Speech Service not configured. Voice features disabled.');
        }
    }

    async speechToText(audioBuffer) {
        if (!this.enabled) {
            throw new Error('Azure Speech Service not configured');
        }

        return new Promise((resolve, reject) => {
            try {
                const pushStream = sdk.AudioInputStream.createPushStream();
                pushStream.write(audioBuffer);
                pushStream.close();

                const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);
                const recognizer = new sdk.SpeechRecognizer(this.speechConfig, audioConfig);

                recognizer.recognizeOnceAsync(
                    result => {
                        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
                            resolve({
                                text: result.text,
                                confidence: result.properties.getProperty(
                                    sdk.PropertyId.SpeechServiceResponse_JsonResult
                                )
                            });
                        } else {
                            reject(new Error('Speech not recognized'));
                        }
                        recognizer.close();
                    },
                    error => {
                        recognizer.close();
                        reject(error);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    async textToSpeech(text, language = 'am-ET') {
        if (!this.enabled) {
            throw new Error('Azure Speech Service not configured');
        }

        return new Promise((resolve, reject) => {
            try {
                if (language === 'am-ET' || language === 'am') {
                    this.speechConfig.speechSynthesisVoiceName = 'am-ET-MekdesNeural';
                } else {
                    this.speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
                }

                const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

                synthesizer.speakTextAsync(
                    text,
                    result => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            resolve({
                                audioData: result.audioData,
                                format: 'audio/wav'
                            });
                        } else {
                            reject(new Error('Speech synthesis failed'));
                        }
                        synthesizer.close();
                    },
                    error => {
                        synthesizer.close();
                        reject(error);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    async textToSpeechSSML(ssml, language = 'am-ET') {
        if (!this.enabled) {
            throw new Error('Azure Speech Service not configured');
        }

        return new Promise((resolve, reject) => {
            try {
                const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig);

                synthesizer.speakSsmlAsync(
                    ssml,
                    result => {
                        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                            resolve({
                                audioData: result.audioData,
                                format: 'audio/wav'
                            });
                        } else {
                            reject(new Error('Speech synthesis failed'));
                        }
                        synthesizer.close();
                    },
                    error => {
                        synthesizer.close();
                        reject(error);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    generateSSML(text, language = 'am-ET', rate = '1.0', pitch = '0%') {
        const voice = language === 'am-ET' || language === 'am'
            ? 'am-ET-MekdesNeural'
            : 'en-US-JennyNeural';

        return `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${language}">
        <voice name="${voice}">
          <prosody rate="${rate}" pitch="${pitch}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;
    }
}

module.exports = new AzureSpeechService();
