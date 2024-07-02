import OpenAI from 'openai';

export default async function fetchOpenAICompletion(options) {
  const {
    apiKey,
    context,
    model,
    prompt
  } = options;

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        'role': 'system',
        'content': 'FEEL (Friendly Enough Expression Language) expert'
      },
      {
        'role': 'user',
        'content': `${context}
${prompt}`
      }
    ],
    model
  });

  console.log('[OPENAI] response:', chatCompletion);

  const { choices = [] } = chatCompletion;

  if (!choices.length) {
    return null;
  }

  const { message } = choices[ 0 ];

  const { content } = message;

  return content;
}