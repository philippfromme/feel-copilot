import OpenAI from 'openai';

export async function fetchOpenAICompletion(options) {
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

  const { choices = [] } = chatCompletion;

  if (!choices.length) {
    return null;
  }

  const { message } = choices[ 0 ];

  const { content } = message;

  return content;
}

export async function fetchFineTunedModels(options) {
  const {
    apiKey
  } = options;

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const list = await openai.fineTuning.jobs.list();

  return list.data
    .filter(job => {
      const { status } = job;

      return status === 'succeeded';
    })
    .map(job => {
      const { fine_tuned_model } = job;

      return fine_tuned_model;
    });
}