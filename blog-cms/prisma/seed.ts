import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const starterPosts = [
  {
    slug: "weekly-plan",
    category: "Study planning",
    title: "Build a weekly study plan you can actually follow",
    excerpt:
      "A useful plan starts with the time and energy you really have. Break a broad goal into manageable sessions, leave room to adjust, and use a short review to decide what comes next.",
    body: `When exams or deadlines feel distant, it is easy to put off getting started. When they feel close, it is easy to fill every spare hour with revision. A weekly plan can help you find a steadier middle ground.

## Start with the commitments you already have

Write down classes, work, travel, meals, rest, and other fixed commitments first. Then look for realistic study windows. Short, focused blocks are often easier to protect than a long session that asks too much of your day.

Give each block a specific outcome rather than a vague label. For example, “review lecture 4 and make five recall questions” gives you a clear finish line.

## Balance your subjects and your methods

Spread demanding topics across the week and revisit important ideas more than once. Alternate between methods such as explaining a concept from memory, solving a problem, and checking your notes. This helps you see what you can retrieve and what still needs work.

> Leave a little unplanned time in the week. A flexible plan is easier to recover when something unexpected comes up.

## Review and adjust

At the end of the week, take a few minutes to note what you completed and what needs another session. Move unfinished work forward instead of treating it as a failure. The goal is a plan that supports learning, not a perfect-looking calendar.`,
  },
  {
    slug: "practice-questions",
    category: "Practice",
    title: "Make practice questions work harder for you",
    excerpt:
      "Turn each set of questions into a learning loop: attempt, check, understand, and try again later.",
    body: `Practice is most useful when it helps you find the next thing to learn. Treat every question as feedback, not just a score.

A set of questions can reveal which ideas you can use confidently and which ones need another look. To get that benefit, slow down enough to learn from the answers after you finish.

## Try before you check

When possible, answer from memory before looking at notes or solutions. If you are unsure, make your best attempt and mark the question to revisit. This gives you a more accurate picture of what you can recall independently.

## Review the reasoning, not only the result

For each missed or uncertain question, identify the reason: a concept you have not understood, a step you forgot, or a detail you misread. Rework the solution in your own words, then make a brief note about the idea behind it.

> A wrong answer is useful information. Record the concept to revisit, rather than copying a long solution you may not read again.

## Return to difficult questions later

After a gap, try the question again without looking at your earlier work. If you can explain the steps and why they work, you are building understanding rather than memorising one answer.`,
  },
  {
    slug: "revision-notes",
    category: "Revision",
    title: "Turn class notes into useful revision material",
    excerpt:
      "Transform notes from a record of what you heard into prompts that help you retrieve what you know.",
    body: `Notes are a starting point, not the finished product. A few small changes can turn them into a resource that helps you practise remembering and explaining ideas.

Notes often make sense while a class is fresh in your mind, but rereading them later can feel passive. Revisiting them soon after class gives you a chance to fill gaps and decide what deserves attention.

## Clarify before you condense

Check that key terms, examples, and steps are clear. Add a short explanation where you wrote only a heading or copied a phrase without context. Use your course materials to verify details rather than guessing.

## Turn headings into questions

A heading such as “causes of inflation” can become a prompt: “What are two causes, and how do they differ?” Cover the answer and try to explain it from memory. Questions expose gaps more clearly than highlighting alone.

> Keep your revision notes concise enough to use. You can always return to the original lecture material for additional detail.

## Use examples to check understanding

For each important idea, try a worked example, a small diagram, or an explanation in your own words. If you cannot connect the example to the concept, mark that point for review or ask your instructor for clarification.`,
  },
  {
    slug: "study-materials",
    category: "Resources",
    title: "Choose study materials with a clear purpose",
    excerpt:
      "Before adding another guide or question bank, connect the resource to your course goals and current needs.",
    body: `The best resource is not necessarily the newest or longest one. Choose materials that match your course, your current learning goal, and the kind of practice you need.

It is tempting to gather many guides, videos, and question sets when a topic feels difficult. Too many sources can make it harder to know where to focus. Start with the learning objectives and materials recommended for your course.

## Match the resource to the task

If you need to understand an unfamiliar concept, look for a clear explanation and examples. If you understand the basics but need fluency, choose practice that lets you apply the idea. For recall, use questions or prompts that make you retrieve information rather than simply reread it.

## Check relevance and reliability

Compare a resource with your syllabus, course terminology, and instructor guidance. Make sure its level and coverage fit your class. When in doubt, ask your instructor, librarian, or academic support service before relying on it.

> Before using a resource, name the specific question it should help you answer. If you cannot, pause before adding it to your study list.

## Use one resource actively

Work through a small section, then close it and summarise the main idea or solve a related question. An active session with one well-chosen resource can be more useful than collecting several resources without time to practise.`,
  },
  {
    slug: "exam-week",
    category: "Exam prep",
    title: "A calmer approach to the week before an exam",
    excerpt:
      "Use the final week to consolidate, practise under realistic conditions, and protect the routines that help you think clearly.",
    body: `The final week is a time to consolidate what you have learned, identify the most useful remaining practice, and protect the routines that help you think clearly.

A last-minute rush can make every topic seem equally urgent. Begin by checking the exam format, course objectives, and what you already know. This helps you make informed choices about how to use the remaining time.

## Prioritise what needs attention

Make a short list of topics you can explain confidently, topics that need practice, and topics you do not yet understand. Spend more time on important gaps while making brief returns to material you already know.

## Practise in a realistic way

Try a set of relevant questions under conditions similar to the exam when appropriate. Review the result carefully and use it to shape your next study block. Avoid using practice scores as a prediction of your worth or potential.

> Sleep, food, movement, and breaks are part of preparation. They support concentration and are worth protecting during a busy week.

## Prepare the practical details

Check the exam information from your course, decide what materials or access you need, and make a simple plan for the day. A few practical checks can leave more attention for the work itself.`,
  },
];

async function main() {
  for (const post of starterPosts) {
    await db.post.upsert({
      where: { slug: post.slug },
      create: { ...post, status: "PUBLISHED" },
      update: {},
    });
  }
  console.log(`Seeded ${starterPosts.length} VersaExam editorial starter posts.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => db.$disconnect());
