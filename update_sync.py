import re

def update_game_file(filepath, game_id, storage_key):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The pattern to find the fetchBestScore block
    old_pattern = r'if \(snap\.exists\(\)\) \{\s*const [a-zA-Z]+Best = snap\.data\(\)\.bestScores\?\.[a-zA-Z]+ \|\| 0;\s*setBestScore\(prev => \{\s*const newBest = Math\.max\(prev, [a-zA-Z]+Best\);\s*localStorage\.setItem\([\'"][^\'"]+[\'"], newBest\.toString\(\)\);\s*return newBest;\s*\}\);\s*\}'

    # Replacement logic
    new_code = f"""const bestFromDb = snap.exists() ? (snap.data().bestScores?.{game_id} || 0) : 0;
            setBestScore(prev => {{
              const newBest = Math.max(prev, bestFromDb);
              localStorage.setItem('{storage_key}', newBest.toString());
              if (prev > bestFromDb) {{
                setDoc(docRef, {{ uid: auth.currentUser!.uid, bestScores: {{ {game_id}: prev }} }}, {{ merge: true }}).catch(console.error);
              }}
              return newBest;
            }});"""

    new_content = re.sub(old_pattern, new_code, content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

update_game_file('src/components/FlappyPhilosopher.tsx', 'flappy', 'flappy_best')
update_game_file('src/components/PhilosophicalMemory.tsx', 'memory', 'memory_best_score')
update_game_file('src/components/PenaltyGoalkeeper.tsx', 'penalty', 'penalty_best')

print("Updated all 3 games")
