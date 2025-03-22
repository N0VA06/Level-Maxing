import { Devvit, useState, useInterval } from '@devvit/public-api';
const DARK_THEME = {
  background: "#1A1A1B",         // Dark background
  cardBackground: "#272729",     // Slightly lighter for cards
  border: "#343536",             // Dark border
  textPrimary: "#D7DADC",        // Light gray text
  textSecondary: "#818384",      // Medium gray text
  accent: "#FF4500",             // Reddit orange
  primary: "#0079D3",            // Reddit blue
  success: "#0EA529",            // Green for success states
  warning: "#FF8717",            // Orange warning
  danger: "#FF585B",             // Red for danger/errors
  headerBackground: "#1A1A1B",   // Header background
};
// Game data constants remain the same
// Only showing a sample here for brevity
const MONSTERS = [
  {
    id: 'goblin',
    name: 'Goblin Scout',
    health: 50,
    maxHealth: 50,
    damage: 5,
    experience: 20,
    goldDrop: 15,
    description: 'A small, nimble goblin armed with a rusty dagger.'
  },
  // Other monsters...
];

const QUESTS = [
  {
    id: 'goblin_camp',
    name: 'Clear the Goblin Camp',
    description: 'A band of goblins has been raiding local farmers. Eliminate them to restore peace.',
    difficulty: 'Easy',
    monsters: [
      { ...MONSTERS[0] }, // Goblin
      { ...MONSTERS[0] }, // Goblin
    ],
    currentMonsterIndex: 0,
    rewards: {
      gold: 50,
      experience: 100,
      items: [],
    },
    isComplete: false,
  },
  // Other quests...
];

const STARTER_ITEMS = {
  Warrior: {
    id: 'sword',
    name: 'Iron Sword',
    type: 'weapon',
    value: 10,
    power: 5,
    description: 'A standard iron sword. Reliable in combat.'
  },
  // Other class items...
};

const SHOP_ITEMS = [
  {
    id: 'steel_sword',
    name: 'Steel Sword',
    type: 'weapon',
    value: 100,
    power: 12,
    description: 'A well-crafted steel sword with improved damage.'
  },
  // Other shop items...
];

const CLASS_SKILLS = {
  Warrior: [
    {
      id: 'slash',
      name: 'Slash',
      damage: 10,
      cooldown: 0,
      currentCooldown: 0,
      description: 'A basic slash attack'
    },
    // Other skills...
  ],
  // Other classes...
};

// Configure Devvit
Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Individual UI Block Components
const CharacterBlock = ({ player, isCurrentPlayer = false }) => {
  if (!player) return (
    <vstack 
      padding="medium" 
      backgroundColor="#F8F9FA" 
      borderRadius="medium"
      border="thin"
      borderColor="#DAE0E6"
    >
      <text>Character not found</text>
    </vstack>
  );
  
  return (
    <vstack 
      padding="medium" 
      backgroundColor="#F8F9FA" 
      borderRadius="medium"
      border="thin"
      borderColor="#DAE0E6"
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large">{player.username}</text>
        <text 
          color={player.health <= 0 ? "#FF4500" : "#0079D3"} 
          weight="bold"
        >
          {player.health <= 0 ? "Knocked Out" : `Lvl ${player.level} ${player.class}`}
        </text>
      </hstack>
      
      <hstack gap="medium" padding="small">
        <vstack width="33%">
          <text size="small" color="#878A8C">Health</text>
          <text weight="bold">{player.health}/{player.maxHealth} ❤️</text>
        </vstack>
        <vstack width="33%">
          <text size="small" color="#878A8C">Gold</text>
          <text weight="bold">{player.gold} 💰</text>
        </vstack>
        <vstack width="33%">
          <text size="small" color="#878A8C">XP</text>
          <text weight="bold">{player.experience}/{player.level * 100} 📊</text>
        </vstack>
      </hstack>
      
      <hstack padding="small">
        <vstack width="50%">
          <text size="small" color="#878A8C">Weapon</text>
          <text>{player.equipment.weapon?.name || "None"}</text>
        </vstack>
        <vstack width="50%">
          <text size="small" color="#878A8C">Armor</text>
          <text>{player.equipment.armor?.name || "None"}</text>
        </vstack>
      </hstack>
      
      {isCurrentPlayer && (
        <vstack paddingTop="small">
          <text size="small" weight="bold" color="#878A8C">COMMANDS:</text>
          <text size="small">/stats - View detailed stats</text>
          <text size="small">/inventory - View your items</text>
        </vstack>
      )}
    </vstack>
  );
};

const QuestBlock = ({ quest, index, onStartQuest, battleInProgress }) => {
  return (
    <vstack 
      padding="medium" 
      backgroundColor="#F8F9FA" 
      borderRadius="medium"
      border="thin"
      borderColor="#DAE0E6"
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large">{quest.name}</text>
        <text 
          color={quest.isComplete ? "#0EA529" : (quest.difficulty === 'Easy' ? "#0079D3" : (quest.difficulty === 'Medium' ? "#FF4500" : "#A10D00"))} 
          weight="bold"
        >
          {quest.isComplete ? "COMPLETED" : quest.difficulty}
        </text>
      </hstack>
      
      <text paddingVertical="small">{quest.description}</text>
      
      <hstack paddingTop="small">
        <vstack width="50%">
          <text size="small" color="#878A8C">Reward</text>
          <text>{quest.rewards.gold} gold, {quest.rewards.experience} XP</text>
        </vstack>
        
        <vstack width="50%" alignment="end middle">
          {quest.isComplete ? (
            <hstack backgroundColor="#F6F7F8" padding="small" borderRadius="medium">
              <text color="#0EA529" weight="bold">✓ Complete</text>
            </hstack>
          ) : (
            <button 
              color="primary" 
              disabled={battleInProgress}
              onPress={() => onStartQuest(index)}
            >
              Start Quest
            </button>
          )}
        </vstack>
      </hstack>
    </vstack>
  );
};

const BattleBlock = ({ gameState, currentUser }) => {
  if (!gameState?.battleState.isActive) {
    return (
      <vstack 
        padding="medium" 
        backgroundColor="#F8F9FA" 
        borderRadius="medium"
        border="thin"
        borderColor="#DAE0E6"
        alignment="middle center"
      >
        <text size="large" weight="bold" color="#878A8C">No Active Battle</text>
        <text color="#878A8C" paddingVertical="small">Start a quest to begin an adventure!</text>
      </vstack>
    );
  }
  
  const currentQuest = gameState.quests[gameState.currentQuest];
  const currentMonster = currentQuest.monsters[currentQuest.currentMonsterIndex];
  const isPlayerTurn = gameState.battleState.turnOrder[0] === currentUser?.username;
  
  // Calculate monster health percentage for progress bar
  const healthPercentage = Math.max(0, Math.min(100, (currentMonster.health / currentMonster.maxHealth) * 100));
  
  return (
    <vstack 
      padding="medium" 
      backgroundColor="#F8F9FA" 
      borderRadius="medium"
      border="thin"
      borderColor="#DAE0E6"
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large" color="#FF4500">{currentMonster.name}</text>
        <text weight="bold">Round {gameState.battleState.roundCount}</text>
      </hstack>
      
      <text paddingVertical="small">{currentMonster.description}</text>
      
      {/* Monster health bar */}
      <vstack paddingVertical="small">
        <hstack alignment="middle space-between">
          <text size="small" color="#878A8C">Monster Health</text>
          <text size="small">{currentMonster.health}/{currentMonster.maxHealth}</text>
        </hstack>
        <hstack width="100%" height="12px" backgroundColor="#F6F7F8" borderRadius="full">
          <hstack 
            width={`${healthPercentage}%`} 
            height="100%" 
            backgroundColor={healthPercentage > 50 ? "#0EA529" : (healthPercentage > 25 ? "#FF4500" : "#A10D00")}
            borderRadius="full"
          />
        </hstack>
      </vstack>
      
      {/* Turn order */}
      <vstack paddingVertical="small">
        <text size="small" weight="bold" color="#878A8C">TURN ORDER:</text>
        <hstack gap="small" wrap="wrap">
          {gameState.battleState.turnOrder.map((player, index) => (
            <hstack 
              backgroundColor={index === 0 ? "#0079D3" : "#F6F7F8"}
              padding="xsmall"
              borderRadius="medium"
            >
              <text 
                color={index === 0 ? "white" : "#878A8C"}
                weight={index === 0 ? "bold" : "normal"}
              >
                {index === 0 ? "➤ " : ""}{player}
              </text>
            </hstack>
          ))}
        </hstack>
      </vstack>
      
      {/* Battle log */}
      <vstack 
        backgroundColor="#F6F7F8"
        padding="small"
        borderRadius="medium"
        paddingVertical="small"
      >
        <text size="small" weight="bold" color="#878A8C">BATTLE LOG:</text>
        {gameState.log.slice(-2).map(entry => (
          <text size="small">{entry}</text>
        ))}
      </vstack>
      
      {/* Battle commands */}
      {isPlayerTurn && (
        <vstack paddingTop="small">
          <text size="small" weight="bold" color="#878A8C">YOUR TURN! COMMANDS:</text>
          <text size="small">/attack - Basic attack</text>
          {currentUser?.skills.map(skill => (
            <text size="small">/attack {skill.name} - {skill.description}</text>
          ))}
          {currentUser?.class === 'Cleric' && <text size="small">/heal [player] - Heal a party member</text>}
        </vstack>
      )}
    </vstack>
  );
};

const ShopBlock = ({ shopItems, playerGold }) => {
  return (
    <vstack 
      padding="medium" 
      backgroundColor="#F8F9FA" 
      borderRadius="medium"
      border="thin"
      borderColor="#DAE0E6"
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large">Town Shop</text>
        <text>Your Gold: {playerGold || 0} 💰</text>
      </hstack>
      
      <vstack paddingVertical="small" gap="small">
        {shopItems?.slice(0, 3).map(item => (
          <hstack 
            backgroundColor="#F6F7F8"
            padding="small"
            borderRadius="medium"
            gap="small"
          >
            <vstack width="70%">
              <text weight="bold">{item.name}</text>
              <text size="small">{item.description}</text>
              {item.power && <text size="small">Power: {item.power}</text>}
            </vstack>
            
            <vstack width="30%" alignment="end middle">
              <text weight="bold">{item.value} 💰</text>
              <text size="small" color="#878A8C">Type: {item.type}</text>
            </vstack>
          </hstack>
        ))}
      </vstack>
      
      <vstack paddingTop="small">
        <text size="small" weight="bold" color="#878A8C">COMMANDS:</text>
        <text size="small">/shop - View all items</text>
        <text size="small">/buy [item] - Purchase an item</text>
      </vstack>
    </vstack>
  );
};

const JoinBlock = ({ gameState, selectedClass, setSelectedClass, handleJoinGame, handleReady, userId }) => {
  return (
    <vstack 
      padding="medium" 
      backgroundColor="#F8F9FA" 
      borderRadius="medium"
      border="thin"
      borderColor="#DAE0E6"
      alignment="center middle"
    >
      <text size="large" weight="bold" color="#0079D3">Join the Adventure</text>
      <text size="small" paddingVertical="small">Players: {gameState?.players.length || 0}/4</text>
      
      {(!gameState?.players.length || gameState.players.length < 4) && 
        !gameState?.players.find(p => p.id === userId) ? (
        <vstack gap="medium" width="100%" alignment="center middle">
          <text>Choose your class:</text>
          <hstack gap="small" wrap="wrap">
            {['Warrior', 'Mage', 'Rogue', 'Cleric'].map((cls) => (
              <button 
                color={selectedClass === cls ? 'primary' : 'secondary'}
                onPress={() => setSelectedClass(cls)}
              >
                {cls}
              </button>
            ))}
          </hstack>
          <button color="primary" onPress={handleJoinGame}>Join the Adventure</button>
        </vstack>
      ) : (
        <vstack gap="medium" width="100%" alignment="center middle">
          {gameState?.players.find(p => p.id === userId && !p.isReady) ? (
            <button onPress={handleReady}>Ready Up</button>
          ) : (
            <text>
              {gameState?.players.filter(p => p.isReady).length || 0}/{gameState?.players.length || 0} Players Ready
            </text>
          )}
          <text>Waiting for all players to be ready...</text>
        </vstack>
      )}
    </vstack>
  );
};

// Reddit-themed custom post type for the game
Devvit.addCustomPostType({
  name: 'Dungeon Quests',
  height: 'tall',
  render: (context) => {
    // State variables 
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState('Warrior');
    const [activePage, setActivePage] = useState('main'); // main, profile, quests, shop, party
    
    // Sync with Redis storage
    useInterval(async () => {
      try {
        if (!context.postId) return;
        
        const storedState = await context.redis.get(`dungeon_${context.postId}`);
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          setGameState(parsedState);
        } else {
          // Initialize new game
          const newGameState = {
            players: [],
            quests: JSON.parse(JSON.stringify(QUESTS)), // Deep copy
            currentQuest: null,
            readyPlayers: [],
            gameStarted: false,
            currentTurn: 0,
            log: [],
            battleState: {
              isActive: false,
              turnOrder: [],
              roundCount: 0,
              lastAction: '',
            },
            shopItems: [...SHOP_ITEMS] // Initialize shop
          };
          
          await context.redis.set(`dungeon_${context.postId}`, JSON.stringify(newGameState));
          setGameState(newGameState);
        }
      } finally {
        setIsLoading(false);
      }
    }, 1000).start();
    
    // Action handlers
    const handleJoinGame = async () => {
      if (!gameState || gameState.gameStarted) return;
      
      const user = await context.reddit.getCurrentUser();
      if (!user) return;
      
      if (gameState.players.find(p => p.username === user.username)) return;
      
      const starterItem = STARTER_ITEMS[selectedClass];
      
      const newPlayer = {
        id: user.id,
        username: user.username,
        level: 1,
        health: 100,
        maxHealth: 100,
        gold: 50,
        experience: 0,
        class: selectedClass,
        inventory: [{ ...starterItem }],
        equipment: {
          weapon: { ...starterItem },
          armor: null
        },
        skills: [...CLASS_SKILLS[selectedClass]],
        isReady: false
      };
      
      const updatedState = {
        ...gameState,
        players: [...gameState.players, newPlayer],
      };
      
      await context.redis.set(`dungeon_${context.postId}`, JSON.stringify(updatedState));
      setGameState(updatedState);
    };
    
    const handleReady = async () => {
      if (!gameState) return;
      
      const user = await context.reddit.getCurrentUser();
      if (!user) return;
      
      const playerIndex = gameState.players.findIndex(p => p.id === user.id);
      if (playerIndex === -1) return;
      
      const updatedPlayers = [...gameState.players];
      updatedPlayers[playerIndex].isReady = true;
      
      const allReady = updatedPlayers.every(p => p.isReady);
      
      const updatedState = {
        ...gameState,
        players: updatedPlayers,
        gameStarted: allReady && updatedPlayers.length >= 1 // Allow solo play for testing
      };
      
      await context.redis.set(`dungeon_${context.postId}`, JSON.stringify(updatedState));
      setGameState(updatedState);
    };
    
    const handleStartQuest = async (questIndex) => {
      if (!gameState || gameState.battleState.isActive) return;
      
      // Deep copy the quest to reset it if previously attempted
      const quest = JSON.parse(JSON.stringify(QUESTS[questIndex]));
      
      const updatedState = {
        ...gameState,
        currentQuest: questIndex,
        quests: [
          ...gameState.quests.slice(0, questIndex),
          quest,
          ...gameState.quests.slice(questIndex + 1)
        ],
        battleState: {
          isActive: true,
          turnOrder: gameState.players.map(p => p.username),
          roundCount: 1,
          lastAction: '',
        },
        log: [
          ...gameState.log,
          `Quest Started: **${quest.name}**`,
          `First monster: **${quest.monsters[0].name}**`,
          `${quest.monsters[0].description}`
        ]
      };
      
      // Shuffle turn order
      for (let i = updatedState.battleState.turnOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [updatedState.battleState.turnOrder[i], updatedState.battleState.turnOrder[j]] = 
        [updatedState.battleState.turnOrder[j], updatedState.battleState.turnOrder[i]];
      }
      
      await context.redis.set(`dungeon_${context.postId}`, JSON.stringify(updatedState));
      setGameState(updatedState);
      
      // Post a comment to start the battle
      await context.reddit.submitComment({
        text: `# Quest: ${quest.name} - Battle Start!

${quest.description}

You encounter a **${quest.monsters[0].name}**!
${quest.monsters[0].description}

## Battle Commands:
- \`/attack\` - Use default attack
- \`/attack [skill]\` - Use a specific skill
- \`/heal [player]\` - Heal a player (Clerics only)

First player to act: **${updatedState.battleState.turnOrder[0]}**`,
        id: context.postId
      });
    };
    
    const handleRest = async () => {
      if (!gameState || gameState.battleState.isActive) return;
      
      const healedPlayers = gameState.players.map(p => ({
        ...p,
        health: p.maxHealth
      }));
      
      const updatedState = {
        ...gameState,
        players: healedPlayers,
        log: [
          ...gameState.log,
          `The party takes a rest and recovers to full health.`
        ]
      };
      
      await context.redis.set(`dungeon_${context.postId}`, JSON.stringify(updatedState));
      setGameState(updatedState);
      
      await context.reddit.submitComment({
        text: `# Party Rest
The party takes a rest at the campfire. All players have recovered to full health.`,
        id: context.postId
      });
    };
    
    // Show loading state if data isn't ready
    if (!context.postId || isLoading) {
      return (
        <vstack alignment="middle center" height="100%">
          <text size="large">Loading Dungeon Quests...</text>
        </vstack>
      );
    }
    
    // Get current user's player data
    const currentUser = gameState?.players.find(p => p.id === context.userId);
    
    // Show lobby if game hasn't started
    if (!gameState?.gameStarted) {
      return (
        <vstack>
          {/* Reddit-themed header */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor="#DAE0E6" 
            borderRadius="small"
            gap="small"
          >
            <text weight="bold" color="#1A1A1B">Dungeon Quests - Lobby</text>
          </hstack>
          
          <JoinBlock
            gameState={gameState}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            handleJoinGame={handleJoinGame}
            handleReady={handleReady}
            userId={context.userId}
          />
        </vstack>
      );
    }
    
    // Main page: Character + Battle + Shop layout in 3 blocks
    if (activePage === 'main') {
      return (
        <vstack gap="small">
          {/* Reddit-themed header with navigation tabs */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor="#DAE0E6" 
            borderRadius="small"
            gap="small"
            alignment="middle space-between"
          >
            <text weight="bold" color="#1A1A1B">Dungeon Quests</text>
            
            <hstack gap="small">
              <button 
                size="small" 
                color="primary" 
                onPress={() => setActivePage('main')}
              >
                Main
              </button>
              <button 
                size="small" 
                color="secondary" 
                onPress={() => setActivePage('quests')}
              >
                Quests
              </button>
              <button 
                size="small" 
                color="secondary" 
                onPress={() => setActivePage('party')}
              >
                Party
              </button>
            </hstack>
          </hstack>
          
          {/* Three-block layout */}
          <vstack gap="small">
            {/* Block 1: Character info */}
            <CharacterBlock 
              player={currentUser} 
              isCurrentPlayer={true}
            />
            
            {/* Block 2: Current battle or quest */}
            <BattleBlock 
              gameState={gameState}
              currentUser={currentUser}
            />
            
            {/* Block 3: Shop preview */}
            <ShopBlock 
              shopItems={gameState.shopItems} 
              playerGold={currentUser?.gold}
            />
          </vstack>
        </vstack>
      );
    }
    
    // Quests page
    if (activePage === 'quests') {
      return (
        <vstack gap="small">
          {/* Reddit-themed header with navigation tabs */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor="#DAE0E6" 
            borderRadius="small"
            gap="small"
            alignment="middle space-between"
          >
            <text weight="bold" color="#1A1A1B">Dungeon Quests - Quests</text>
            
            <hstack gap="small">
              <button 
                size="small" 
                color="secondary" 
                onPress={() => setActivePage('main')}
              >
                Main
              </button>
              <button 
                size="small" 
                color="primary" 
                onPress={() => setActivePage('quests')}
              >
                Quests
              </button>
              <button 
                size="small" 
                color="secondary" 
                onPress={() => setActivePage('party')}
              >
                Party
              </button>
            </hstack>
          </hstack>
          
          {/* Quests list */}
          <vstack gap="small">
            {gameState.quests.map((quest, index) => (
              <QuestBlock 
                quest={quest} 
                index={index} 
                onStartQuest={handleStartQuest}
                battleInProgress={gameState.battleState.isActive}
              />
            ))}
            
            {/* Rest button */}
            <vstack 
              padding="medium" 
              backgroundColor="#F8F9FA" 
              borderRadius="medium"
              border="thin"
              borderColor="#DAE0E6"
              alignment="middle center"
            >
              <button 
                color="secondary"
                onPress={handleRest}
                disabled={gameState?.battleState.isActive}
              >
                Rest (Recover All HP)
              </button>
            </vstack>
          </vstack>
        </vstack>
      );
    }
    
    // Party page
    if (activePage === 'party') {
      return (
        <vstack gap="small">
          {/* Reddit-themed header with navigation tabs */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor="#DAE0E6" 
            borderRadius="small"
            gap="small"
            alignment="middle space-between"
          >
            <text weight="bold" color="#1A1A1B">Dungeon Quests - Party</text>
            
            <hstack gap="small">
              <button 
                size="small" 
                color="secondary" 
                onPress={() => setActivePage('main')}
              >
                Main
              </button>
              <button 
                size="small" 
                color="secondary" 
                onPress={() => setActivePage('quests')}
              >
                Quests
              </button>
              <button 
                size="small" 
                color="primary" 
                onPress={() => setActivePage('party')}
              >
                Party
              </button>
            </hstack>
          </hstack>
          
          {/* Party members list */}
          <vstack gap="small">
            {gameState.players.map(player => (
              <CharacterBlock 
                player={player} 
                isCurrentPlayer={player.id === context.userId}
              />
            ))}
            
            {/* Party stats */}
            <vstack 
              padding="medium" 
              backgroundColor="#F8F9FA" 
              borderRadius="medium"
              border="thin"
              borderColor="#DAE0E6"
            >
              <text weight="bold">Party Stats</text>
              <hstack paddingTop="small">
                <vstack width="33%">
                  <text size="small" color="#878A8C">Total Members</text>
                  <text weight="bold">{gameState.players.length}</text>
                </vstack>
                <vstack width="33%">
                  <text size="small" color="#878A8C">Active Members</text>
                  <text weight="bold">{gameState.players.filter(p => p.health > 0).length}</text>
                </vstack>
                <vstack width="33%">
                  <text size="small" color="#878A8C">Average Level</text>
                  <text weight="bold">{Math.round(gameState.players.reduce((acc, p) => acc + p.level, 0) / gameState.players.length)}</text>
                </vstack>
              </hstack>
            </vstack>
          </vstack>
        </vstack>
      );
    }
  }
});

// Menu item to create new game
Devvit.addMenuItem({
  label: 'Create New Dungeon Quest',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    const post = await reddit.submitPost({
      title: 'Dungeon Quests Adventure',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading Dungeon Quests...</text>
        </vstack>
      ),
    });
    
    ui.showToast({ text: 'Adventure begins!' });
    ui.navigateTo(post);
  },
});

// Event handler for comment commands
Devvit.addTrigger({
  event: 'CommentCreate',
  async onEvent(event, context) {
    if (!event.comment?.postId) return;
    const storedState = await context.redis.get(`dungeon_${event.comment.postId}`);
    if (!storedState) return;
    
    const gameState = JSON.parse(storedState);
    if (!gameState?.gameStarted) return;
    
    const comment = event.comment;
    if (!comment) return;
    
    // Parse commands in comments
    const commandMatch = comment.body.match(/^\/([a-z_]+)(?: (.+))?$/i);
    if (!commandMatch) return;
    
    const command = commandMatch[1].toLowerCase();
    const args = commandMatch[2] || '';
    
    try {
      const user = await context.reddit.getUserById(comment.author);
      
      // Check if user is a player
      const playerIndex = gameState.players.findIndex(p => p.username === user.username);
      if (playerIndex === -1) {
        await context.reddit.submitComment({
          text: `@${user.username} You must be a player in the game to use commands.`,
          id: comment.parentId
        });
        return;
      }
      
      // Non-battle commands that can be used anytime
      if (command === 'help') {
        await context.reddit.submitComment({
          text: `# Dungeon Quests Commands
          
**Battle Commands:**
- \`/attack\` - Use default attack
- \`/attack [skill_name]\` - Use a specific skill
- \`/heal [player_name]\` - Heal a player (Clerics only)

**Town Commands:**
- \`/shop\` - View available items in the shop
- \`/buy [item_name]\` - Purchase an item from the shop
- \`/inventory\` - View your inventory
- \`/equip [item_name]\` - Equip an item from your inventory
- \`/stats\` - View your character stats

**General Commands:**
- \`/help\` - Show this help message`,
          id: comment.parentId
        });
        return;
      }
      
      // Commands that can only be used in battle
      if (gameState.battleState.isActive) {
        switch (command) {
          case 'attack':
            if (gameState.battleState.turnOrder[0] !== user.username) {
              await context.reddit.submitComment({
                text: `@${user.username} It's not your turn!`,
                id: comment.parentId
              });
              return;
            }
            
            // Process attack
            const attackingPlayer = gameState.players[playerIndex];
            const attackQuest = gameState.quests[gameState.currentQuest];
            const attackMonster = attackQuest.monsters[attackQuest.currentMonsterIndex];
            
            let damage = 0;
            const skillMatch = args.match(/^(\w+)$/);
            
            if (skillMatch) {
              const skillName = skillMatch[1].toLowerCase();
              const skill = attackingPlayer.skills.find(s => s.name.toLowerCase() === skillName);
              
              if (skill) {
                if (skill.currentCooldown > 0) {
                  await context.reddit.submitComment({
                    text: `@${user.username} Skill **${skill.name}** is on cooldown for ${skill.currentCooldown} more turns!`,
                    id: comment.parentId
                  });
                  return;
                }
                
                damage = skill.damage + (attackingPlayer.equipment.weapon?.power || 0);
                
                // Set cooldown
                if (skill.cooldown > 0) {
                  const skillIndex = attackingPlayer.skills.findIndex(s => s.id === skill.id);
                  attackingPlayer.skills[skillIndex].currentCooldown = skill.cooldown;
                }
              } else {
                damage = attackingPlayer.skills[0].damage + (attackingPlayer.equipment.weapon?.power || 0);
              }
            } else {
              // Default attack
              damage = attackingPlayer.skills[0].damage + (attackingPlayer.equipment.weapon?.power || 0);
            }
            
            // Apply damage to monster
            attackMonster.health -= damage;
            
            // Update game log
            gameState.log.push(`**${attackingPlayer.username}** (${attackingPlayer.class}) used ${args || 'a basic attack'} for ${damage} damage on **${attackMonster.name}**!`);
            
            // Check if monster is defeated
            if (attackMonster.health <= 0) {
              gameState.log.push(`**${attackMonster.name}** has been defeated!`);
              
              // Distribute rewards
              const expPerPlayer = Math.floor(attackMonster.experience / gameState.players.length);
              const goldPerPlayer = Math.floor(attackMonster.goldDrop / gameState.players.length);
              
              gameState.players.forEach((p, i) => {
                gameState.players[i].experience += expPerPlayer;
                gameState.players[i].gold += goldPerPlayer;
                
                // Level up check
                if (p.experience >= p.level * 100) {
                  gameState.players[i].level += 1;
                  gameState.players[i].maxHealth += 10;
                  gameState.players[i].health = gameState.players[i].maxHealth;
                  gameState.log.push(`**${p.username}** leveled up to level ${gameState.players[i].level}!`);
                }
              });
              
              // Move to next monster or complete quest
              attackQuest.currentMonsterIndex++;
              if (attackQuest.currentMonsterIndex >= attackQuest.monsters.length) {
                // Quest completed
                attackQuest.isComplete = true;
                gameState.battleState.isActive = false;
                
                // Distribute quest rewards
                const questExpPerPlayer = Math.floor(attackQuest.rewards.experience / gameState.players.length);
                const questGoldPerPlayer = Math.floor(attackQuest.rewards.gold / gameState.players.length);
                
                gameState.players.forEach((p, i) => {
                  gameState.players[i].experience += questExpPerPlayer;
                  gameState.players[i].gold += questGoldPerPlayer;
                });
                
                gameState.log.push(`**Quest Completed**: ${attackQuest.name}`);
                gameState.log.push(`Each player earned ${questExpPerPlayer} XP and ${questGoldPerPlayer} gold!`);
                
                // Reset current quest
                gameState.currentQuest = null;
              } else {
                // Move to next monster
                gameState.log.push(`Get ready to fight the next monster: **${attackQuest.monsters[attackQuest.currentMonsterIndex].name}**!`);
              }
            } else {
              // Monster's turn
              const targetIndex = Math.floor(Math.random() * gameState.players.length);
              const targetPlayer = gameState.players[targetIndex];
              
              // Calculate damage after armor reduction
              let monsterDamage = attackMonster.damage;
              if (targetPlayer.equipment.armor && targetPlayer.equipment.armor.power) {
                monsterDamage = Math.max(1, monsterDamage - targetPlayer.equipment.armor.power);
              }
              
              // Monster deals damage
              targetPlayer.health -= monsterDamage;
              gameState.log.push(`**${attackMonster.name}** attacks **${targetPlayer.username}** for ${monsterDamage} damage!`);
              
              // Check if player is knocked out
              if (targetPlayer.health <= 0) {
                gameState.players[targetIndex].health = 0;
                gameState.log.push(`**${targetPlayer.username}** has been knocked out!`);
                
                // Check if all players are knocked out
                const allKnockedOut = gameState.players.every(p => p.health <= 0);
                if (allKnockedOut) {
                  gameState.battleState.isActive = false;
                  gameState.log.push(`**Party Wiped**: All players have been defeated!`);
                  gameState.log.push(`The party must rest and recover before attempting another quest.`);
                }
              }
              
              // Reduce cooldowns for all players
              gameState.players.forEach((p, i) => {
                gameState.players[i].skills.forEach((s, j) => {
                  if (s.currentCooldown > 0) {
                    gameState.players[i].skills[j].currentCooldown--;
                  }
                });
              });
              
              // Rotate turn order
              const nextPlayer = gameState.battleState.turnOrder.shift();
              if (nextPlayer) {
                gameState.battleState.turnOrder.push(nextPlayer);
              }
            }
            
            break;
            
          case 'heal':
            if (gameState.battleState.turnOrder[0] !== user.username) {
              await context.reddit.submitComment({
                text: `@${user.username} It's not your turn!`,
                id: comment.parentId
              });
              return;
            }
            
            const healingPlayer = gameState.players[playerIndex];
            
            // Find heal skill
            const healSkill = healingPlayer.skills.find(s => s.name.toLowerCase() === 'heal');
            if (!healSkill) {
              await context.reddit.submitComment({
                text: `@${user.username} You don't have a healing ability!`,
                id: comment.parentId
              });
              return;
            }
            
            if (healSkill.currentCooldown > 0) {
              await context.reddit.submitComment({
                text: `@${user.username} Heal is on cooldown for ${healSkill.currentCooldown} more turns!`,
                id: comment.parentId
              });
              return;
            }
            
            // Find target player
            const targetName = args.trim();
            const targetIndex = gameState.players.findIndex(p => p.username.toLowerCase() === targetName.toLowerCase());
            
            if (targetIndex === -1) {
              await context.reddit.submitComment({
                text: `@${user.username} Player "${targetName}" not found in the game.`,
                id: comment.parentId
              });
              return;
            }
            
            // Apply healing
            const healAmount = Math.abs(healSkill.damage);
            gameState.players[targetIndex].health = Math.min(
              gameState.players[targetIndex].health + healAmount,
              gameState.players[targetIndex].maxHealth
            );
            
            // Set cooldown
            const skillIndex = healingPlayer.skills.findIndex(s => s.id === healSkill.id);
            healingPlayer.skills[skillIndex].currentCooldown = healSkill.cooldown;
            
            gameState.log.push(`**${healingPlayer.username}** heals **${gameState.players[targetIndex].username}** for ${healAmount} health!`);
            
            // Monster's turn (same as attack)
            const healQuest = gameState.quests[gameState.currentQuest];
            const healMonster = healQuest.monsters[healQuest.currentMonsterIndex];
            
            // Monster deals damage to random player
            const randomTargetIndex = Math.floor(Math.random() * gameState.players.length);
            const randomPlayer = gameState.players[randomTargetIndex];
            
            // Calculate damage after armor reduction
            let monsterDamage = healMonster.damage;
            if (randomPlayer.equipment.armor && randomPlayer.equipment.armor.power) {
              monsterDamage = Math.max(1, monsterDamage - randomPlayer.equipment.armor.power);
            }
            
            randomPlayer.health -= monsterDamage;
            gameState.log.push(`**${healMonster.name}** attacks **${randomPlayer.username}** for ${monsterDamage} damage!`);
            
            // Rotate turn order
            const nextPlayer = gameState.battleState.turnOrder.shift();
            if (nextPlayer) {
              gameState.battleState.turnOrder.push(nextPlayer);
            }
            
            break;
            
          default:
            // Non-battle commands during battle get a reminder
            await context.reddit.submitComment({
              text: `@${user.username} You're in battle! Available commands: /attack [skill], /heal [player]`,
              id: comment.parentId
            });
            return;
        }
      } else {
        // Town/non-battle commands
        switch (command) {
          case 'shop':
            // Make sure shop items are initialized
            if (!gameState.shopItems) {
              gameState.shopItems = [...SHOP_ITEMS];
            }
            
            const shopList = gameState.shopItems.map(item => 
              `- **${item.name}** (${item.type}): ${item.value} gold - ${item.description}`
            ).join('\n');
            
            await context.reddit.submitComment({
              text: `# Town Shop
Available items for purchase:

${shopList}

Use \`/buy [item_name]\` to purchase an item.`,
              id: comment.parentId
            });
            break;
            
          case 'buy':
            const buyItemName = args.trim();
            if (!buyItemName) {
              await context.reddit.submitComment({
                text: `@${user.username} Please specify an item to buy. Use \`/shop\` to see available items.`,
                id: comment.parentId
              });
              return;
            }
            
            // Make sure shop items are initialized
            if (!gameState.shopItems) {
              gameState.shopItems = [...SHOP_ITEMS];
            }
            
            const buyItem = gameState.shopItems.find(i => i.name.toLowerCase() === buyItemName.toLowerCase());
            if (!buyItem) {
              await context.reddit.submitComment({
                text: `@${user.username} Item "${buyItemName}" not found in the shop. Use \`/shop\` to see available items.`,
                id: comment.parentId
              });
              return;
            }
            
            const buyingPlayer = gameState.players[playerIndex];
            if (buyingPlayer.gold < buyItem.value) {
              await context.reddit.submitComment({
                text: `@${user.username} You don't have enough gold to buy ${buyItem.name}. It costs ${buyItem.value} gold, but you only have ${buyingPlayer.gold}.`,
                id: comment.parentId
              });
              return;
            }
            
            // Purchase the item
            buyingPlayer.gold -= buyItem.value;
            buyingPlayer.inventory.push({...buyItem});
            
            await context.reddit.submitComment({
              text: `@${user.username} You purchased **${buyItem.name}** for ${buyItem.value} gold! Use \`/equip ${buyItem.name}\` to equip it.`,
              id: comment.parentId
            });
            break;
            
          case 'inventory':
            const inventoryPlayer = gameState.players[playerIndex];
            
            if (inventoryPlayer.inventory.length === 0) {
              await context.reddit.submitComment({
                text: `@${user.username} Your inventory is empty. Visit the \`/shop\` to buy items.`,
                id: comment.parentId
              });
              return;
            }
            
            const inventoryList = inventoryPlayer.inventory.map(item => 
              `- **${item.name}** (${item.type}): ${item.description}`
            ).join('\n');
            
            await context.reddit.submitComment({
              text: `# ${inventoryPlayer.username}'s Inventory

${inventoryList}

Currently equipped:
- Weapon: ${inventoryPlayer.equipment.weapon?.name || "None"}
- Armor: ${inventoryPlayer.equipment.armor?.name || "None"}

Use \`/equip [item_name]\` to equip an item.`,
              id: comment.parentId
            });
            break;
            
          case 'equip':
            const equipItemName = args.trim();
            if (!equipItemName) {
              await context.reddit.submitComment({
                text: `@${user.username} Please specify an item to equip. Use \`/inventory\` to see your items.`,
                id: comment.parentId
              });
              return;
            }
            
            const equippingPlayer = gameState.players[playerIndex];
            const equipItem = equippingPlayer.inventory.find(i => i.name.toLowerCase() === equipItemName.toLowerCase());
            
            if (!equipItem) {
              await context.reddit.submitComment({
                text: `@${user.username} You don't have an item called "${equipItemName}" in your inventory.`,
                id: comment.parentId
              });
              return;
            }
            
            // Equip the item based on its type
            if (equipItem.type === 'weapon') {
              // Store the old weapon back in inventory if there was one
              if (equippingPlayer.equipment.weapon) {
                equippingPlayer.inventory.push({...equippingPlayer.equipment.weapon});
              }
              
              // Remove the item from inventory and equip it
              equippingPlayer.inventory = equippingPlayer.inventory.filter(i => i !== equipItem);
              equippingPlayer.equipment.weapon = {...equipItem};
              
              await context.reddit.submitComment({
                text: `@${user.username} You equipped **${equipItem.name}** as your weapon!`,
                id: comment.parentId
              });
            } else if (equipItem.type === 'armor') {
              // Store the old armor back in inventory if there was one
              if (equippingPlayer.equipment.armor) {
                equippingPlayer.inventory.push({...equippingPlayer.equipment.armor});
              }
              
              // Remove the item from inventory and equip it
              equippingPlayer.inventory = equippingPlayer.inventory.filter(i => i !== equipItem);
              equippingPlayer.equipment.armor = {...equipItem};
              
              await context.reddit.submitComment({
                text: `@${user.username} You equipped **${equipItem.name}** as your armor!`,
                id: comment.parentId
              });
            } else if (equipItem.type === 'potion') {
              // Use the potion immediately (assuming health potion)
              equippingPlayer.inventory = equippingPlayer.inventory.filter(i => i !== equipItem);
              
              if (equipItem.id === 'health_potion') {
                const healAmount = 50;
                equippingPlayer.health = Math.min(equippingPlayer.health + healAmount, equippingPlayer.maxHealth);
                
                await context.reddit.submitComment({
                  text: `@${user.username} You drank a **${equipItem.name}** and restored ${healAmount} health!`,
                  id: comment.parentId
                });
              }
            } else {
              await context.reddit.submitComment({
                text: `@${user.username} You can't equip **${equipItem.name}**. It's a ${equipItem.type} item.`,
                id: comment.parentId
              });
            }
            break;
            
          case 'stats':
            const statsPlayer = gameState.players[playerIndex];
            
            await context.reddit.submitComment({
              text: `# ${statsPlayer.username}'s Character Sheet

**Level ${statsPlayer.level} ${statsPlayer.class}**

- ❤️ Health: ${statsPlayer.health}/${statsPlayer.maxHealth}
- 💰 Gold: ${statsPlayer.gold}
- 📊 Experience: ${statsPlayer.experience}/${statsPlayer.level * 100}

**Equipment:**
- Weapon: ${statsPlayer.equipment.weapon?.name || "None"} (Power: ${statsPlayer.equipment.weapon?.power || 0})
- Armor: ${statsPlayer.equipment.armor?.name || "None"} (Defense: ${statsPlayer.equipment.armor?.power || 0})

**Skills:**
${statsPlayer.skills.map(skill => `- ${skill.name}: ${skill.damage > 0 ? `${skill.damage} damage` : `Heals ${Math.abs(skill.damage)}`} (Cooldown: ${skill.cooldown} turns)`).join('\n')}`,
              id: comment.parentId
            });
            break;
            
          default:
            await context.reddit.submitComment({
              text: `@${user.username} Unknown command: ${command}. Type \`/help\` to see available commands.`,
              id: comment.parentId
            });
            return;
        }
      }
      
      // Save updated state
      await context.redis.set(`dungeon_${event.comment.postId}`, JSON.stringify(gameState));
      
      // Post battle update if we're in battle
      if (gameState.battleState.isActive) {
        const logMessages = gameState.log.slice(-5).join('\n\n');
        await context.reddit.submitComment({
          text: `# Battle Update\n\n${logMessages}`,
          id: comment.parentId
        });
      }
      
    } catch (error) {
      console.error('Error processing command:', error);
    }
  }
});

export default Devvit;