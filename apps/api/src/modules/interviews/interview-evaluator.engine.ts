import {
  InterviewQuestionSessionItem,
  InterviewSessionFeedback,
  QuestionBankItem,
  QuestionEvaluationDetail,
} from '@ca-career-os/shared';

/**
 * Deterministic text-based evaluation engine for CA technical interviews.
 */
export function evaluateAnswer(
  question: QuestionBankItem,
  candidateAnswer: string
): QuestionEvaluationDetail {
  if (!candidateAnswer || candidateAnswer.trim().length < 10) {
    return {
      technicalCorrectness: 10,
      completeness: 10,
      reasoning: 10,
      clarity: 20,
      score: 12,
      strengths: [],
      improvementAreas: ['Answer was too brief or incomplete to demonstrate required technical competence.'],
      feedbackNotes: 'Please provide comprehensive explanations with relevant sections, accounting standards, or audit procedures.',
      conceptsIdentified: [],
    };
  }

  const ansLower = candidateAnswer.toLowerCase();
  const conceptsIdentified: string[] = [];
  const missingPoints: string[] = [];

  // Extract key concept keywords from ideal key points
  for (const point of question.idealAnswerKeyPoints) {
    const words = point
      .replace(/[(),;:]/g, ' ')
      .split(' ')
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length > 3 && !['what', 'with', 'must', 'have', 'from', 'they', 'this', 'that', 'under', 'were', 'which'].includes(w));

    const matchedWords = words.filter(w => ansLower.includes(w));
    const coverageRatio = matchedWords.length / words.length;

    if (coverageRatio >= 0.25) {
      conceptsIdentified.push(words.slice(0, 3).join(' '));
    } else {
      missingPoints.push(point.slice(0, 80) + '...');
    }
  }

  const coverageRatio = conceptsIdentified.length / question.idealAnswerKeyPoints.length;

  // Technical Correctness (0-100)
  const technicalCorrectness = Math.min(100, Math.round(coverageRatio * 75 + (ansLower.length > 150 ? 25 : 10)));

  // Completeness (0-100)
  const completeness = Math.min(100, Math.round(coverageRatio * 70 + (missingPoints.length === 0 ? 30 : 10)));

  // Reasoning (0-100)
  const reasoningTerms = ['because', 'therefore', 'hence', 'criteria', 'requirement', 'standard', 'due to', 'controls', 'impact'];
  const matchedReasoning = reasoningTerms.filter(t => ansLower.includes(t));
  const reasoning = Math.min(100, Math.round(40 + matchedReasoning.length * 12));

  // Clarity (0-100)
  const clarity = candidateAnswer.length >= 100 && candidateAnswer.includes('.') ? 85 : 65;

  // Weighted total score
  const score = Math.round(
    technicalCorrectness * 0.4 + completeness * 0.3 + reasoning * 0.2 + clarity * 0.1
  );

  const strengths: string[] = [];
  if (technicalCorrectness >= 70) {
    strengths.push(`Accurately cited core principles relevant to ${question.topic}.`);
  }
  if (reasoning >= 70) {
    strengths.push('Demonstrated structured reasoning and logical sequence in response.');
  }
  if (clarity >= 80) {
    strengths.push('Clear and professional communication appropriate for executive interview.');
  }
  if (strengths.length === 0) {
    strengths.push('Answer attempted key domain keywords.');
  }

  const improvementAreas: string[] = [];
  if (missingPoints.length > 0) {
    improvementAreas.push(`Deepen coverage of: ${missingPoints.slice(0, 2).join(' ')}`);
  }
  if (technicalCorrectness < 75) {
    improvementAreas.push(`Include specific statutory references: ${question.regulatoryReference || question.topic}.`);
  }
  if (improvementAreas.length === 0) {
    improvementAreas.push('Provide practical client engagement examples from your articleship to elevate response.');
  }

  const feedbackNotes = `Overall Score: ${score}/100. ${technicalCorrectness >= 75 ? 'Strong technical command demonstrated.' : 'Technical depth can be sharpened.'} Recommended focus: review ${question.regulatoryReference || question.topic}.`;

  return {
    technicalCorrectness,
    completeness,
    reasoning,
    clarity,
    score,
    strengths,
    improvementAreas,
    feedbackNotes,
    conceptsIdentified,
  };
}

/**
 * Generate aggregate interview session evaluation and personalized learning tasks.
 */
export function aggregateSessionFeedback(
  questions: InterviewQuestionSessionItem[],
  targetPathway: string
): { overallScore: number; feedback: InterviewSessionFeedback } {
  if (questions.length === 0) {
    return {
      overallScore: 0,
      feedback: {
        summary: 'No questions answered in this session.',
        strengths: [],
        criticalWeaknesses: [],
        recommendedPracticeTopics: [],
        recommendedLearningTasks: [],
      },
    };
  }

  const scores = questions.map(q => q.score || 0);
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  const allStrengths = new Set<string>();
  const allWeaknesses = new Set<string>();
  const recommendedPracticeTopics = new Set<string>();
  const recommendedLearningTasks = new Set<string>();

  for (const q of questions) {
    if (q.evaluation) {
      q.evaluation.strengths.forEach(s => allStrengths.add(s));
      q.evaluation.improvementAreas.forEach(w => allWeaknesses.add(w));
    }

    if ((q.score || 0) < 70) {
      recommendedPracticeTopics.add(q.topic);
      recommendedLearningTasks.add(`Review ICAI technical guidance & standard checklist for ${q.topic}`);
    }
  }

  if (recommendedPracticeTopics.size === 0) {
    recommendedPracticeTopics.add(`Advanced scenario testing in ${targetPathway}`);
  }

  const summary = `Session Evaluation Complete (${overallScore}/100). ${
    overallScore >= 80
      ? 'Exceptional interview readiness demonstrated across technical and communication dimensions.'
      : overallScore >= 60
      ? 'Solid fundamental knowledge with actionable opportunities to enhance technical standard references.'
      : 'Foundational review required before senior technical interview rounds.'
  }`;

  return {
    overallScore,
    feedback: {
      summary,
      strengths: Array.from(allStrengths).slice(0, 4),
      criticalWeaknesses: Array.from(allWeaknesses).slice(0, 4),
      recommendedPracticeTopics: Array.from(recommendedPracticeTopics).slice(0, 4),
      recommendedLearningTasks: Array.from(recommendedLearningTasks).slice(0, 4),
    },
  };
}
