import { Devvit, useState, useInterval } from '@devvit/public-api';

// DARK THEME - Shadow Sovereign Style
const SHADOW_THEME = {
  background: "#141414",           // Darker background
  cardBackground: "#1E1E1E",       // Slightly lighter for cards
  border: "#2A2A2A",               // Dark border
  textPrimary: "#E1E1E1",          // Light gray text
  textSecondary: "#A0A0A0",        // Medium gray text
  accent: "#4D2DB7",               // Purple accent (like Sung Jin-Woo's powers)
  primary: "#6643B5",              // Secondary purple
  secondary: "#2A2A2A",            // Dark gray for secondary elements
  success: "#67E8B6",              // Mint green for success states
  warning: "#FFC107",              // Yellow warning
  danger: "#B71C1C",               // Deep red for danger/errors
  headerBackground: "#0A0A0A",     // Header background
};

// Game data constants
const MONSTERS = [
  {
    id: 'goblin',
    name: 'D-Rank Goblin',
    health: 50,
    maxHealth: 50,
    damage: 5,
    experience: 20,
    goldDrop: 15,
    description: 'A weak monster that typically appears in low-rank dungeons.'
  },
  {
    id: 'orc',
    name: 'C-Rank Orc Warrior',
    health: 120,
    maxHealth: 120,
    damage: 12,
    experience: 40,
    goldDrop: 30,
    description: 'A muscular orc warrior armed with a crude axe.'
  },
  {
    id: 'troll',
    name: 'B-Rank Dungeon Troll',
    health: 200,
    maxHealth: 200,
    damage: 20,
    experience: 80,
    goldDrop: 60,
    description: 'A large troll with regenerative abilities.'
  },
  // {
  //   id: 'cerberus',
  //   name: 'A-Rank Cerberus',
  //   health: 350,
  //   maxHealth: 350,
  //   damage: 35,
  //   experience: 150,
  //   goldDrop: 120,
  //   description: 'A three-headed hellhound that breathes fire.'
  // },
  // {
  //   id: 'dragon',
  //   name: 'S-Rank Ice Dragon',
  //   health: 600,
  //   maxHealth: 600,
  //   damage: 60,
  //   experience: 300,
  //   goldDrop: 250,
  //   description: 'An ancient ice dragon capable of freezing its enemies with a single breath.'
  // }
];

const QUESTS = [
  {
    id: 'e_rank_gate',
    name: 'E-Rank Gate',
    description: 'An E-Rank gate has appeared in the city. Clear it before monsters spill out.',
    difficulty: 'E-Rank',
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
  {
    id: 'd_rank_gate',
    name: 'D-Rank Gate',
    description: 'A D-Rank gate threatens nearby civilians. Eliminate all monsters inside.',
    difficulty: 'D-Rank',
    monsters: [
      { ...MONSTERS[0] }, // Goblin
      { ...MONSTERS[0] }, // Goblin
      { ...MONSTERS[1] }, // Orc
    ],
    currentMonsterIndex: 0,
    rewards: {
      gold: 100,
      experience: 200,
      items: [],
    },
    isComplete: false,
  },
  // {
  //   id: 'c_rank_gate',
  //   name: 'C-Rank Gate',
  //   description: 'Hunters have reported strange activity in this C-Rank gate. Investigate and clear it.',
  //   difficulty: 'C-Rank',
  //   monsters: [
  //     { ...MONSTERS[1] }, // Orc
  //     { ...MONSTERS[1] }, // Orc
  //     { ...MONSTERS[2] }, // Troll
  //   ],
  //   currentMonsterIndex: 0,
  //   rewards: {
  //     gold: 200,
  //     experience: 400,
  //     items: [],
  //   },
  //   isComplete: false,
  // },
  // {
  //   id: 'b_rank_gate',
  //   name: 'B-Rank Gate',
  //   description: 'Only experienced hunters should attempt this B-Rank gate. Powerful monsters await inside.',
  //   difficulty: 'B-Rank',
  //   monsters: [
  //     { ...MONSTERS[2] }, // Troll
  //     { ...MONSTERS[2] }, // Troll
  //     { ...MONSTERS[3] }, // Cerberus
  //   ],
  //   currentMonsterIndex: 0,
  //   rewards: {
  //     gold: 400,
  //     experience: 800,
  //     items: [],
  //   },
  //   isComplete: false,
  // },
  // {
  //   id: 'a_rank_gate',
  //   name: 'A-Rank Gate',
  //   description: 'An A-Rank gate has opened. Only top hunters stand a chance against what lies within.',
  //   difficulty: 'A-Rank',
  //   monsters: [
  //     { ...MONSTERS[3] }, // Cerberus
  //     { ...MONSTERS[3] }, // Cerberus
  //     { ...MONSTERS[4] }, // Dragon
  //   ],
  //   currentMonsterIndex: 0,
  //   rewards: {
  //     gold: 800,
  //     experience: 1600,
  //     items: [],
  //   },
  //   isComplete: false,
  // }
];

const STARTER_ITEMS = {
  'Shadow Monarch': {
    id: 'shadow_dagger',
    name: 'Shadow Dagger',
    type: 'weapon',
    value: 10,
    power: 8,
    description: 'A dagger made of shadows that can extend its reach.'
  },
  'Tank Hunter': {
    id: 'shield',
    name: 'Hunter Shield',
    type: 'weapon',
    value: 10,
    power: 5,
    description: 'A sturdy shield that can block monster attacks.'
  },
  'Mage Hunter': {
    id: 'staff',
    name: 'Mana Staff',
    type: 'weapon',
    value: 10,
    power: 7,
    description: 'A staff that channels magical energy for attacks.'
  },
  'Healer Hunter': {
    id: 'wand',
    name: 'Healing Wand',
    type: 'weapon',
    value: 10,
    power: 4,
    description: 'A wand that can channel healing energy.'
  }
};

const SHOP_ITEMS = [
  {
    id: 'steel_sword',
    name: 'Hunter Blade',
    type: 'weapon',
    value: 100,
    power: 15,
    description: 'A well-crafted sword designed for hunting monsters.'
  },
  {
    id: 'shadow_armor',
    name: 'Shadow Armor',
    type: 'armor',
    value: 150,
    power: 12,
    description: 'Lightweight armor made from shadows that absorbs damage.'
  },
  {
    id: 'mana_staff',
    name: 'Enhanced Mana Staff',
    type: 'weapon',
    value: 200,
    power: 25,
    description: 'A powerful staff that channels increased magical energy.'
  },
  {
    id: 'health_potion',
    name: 'Healing Potion',
    type: 'potion',
    value: 50,
    power: 50,
    description: 'Restores 50 health points when consumed.'
  },
  {
    id: 'berserk_gauntlets',
    name: 'Berserker Gauntlets',
    type: 'weapon',
    value: 300,
    power: 30,
    description: 'Gauntlets that increase attack power at the cost of defense.'
  },
  {
    id: 'magic_robe',
    name: 'Mana Robe',
    type: 'armor',
    value: 250,
    power: 15,
    description: 'A robe that enhances magical abilities and provides protection.'
  }
];

const CLASS_SKILLS = {
  'Shadow Monarch': [
    {
      id: 'shadow_strike',
      name: 'Shadow Strike',
      damage: 15,
      cooldown: 0,
      currentCooldown: 0,
      description: 'Strike with shadow-infused power'
    },
    {
      id: 'arise',
      name: 'Arise',
      damage: 30,
      cooldown: 3,
      currentCooldown: 0,
      description: 'Summon a shadow soldier to fight for you'
    },
    {
      id: 'shadow_exchange',
      name: 'Shadow Exchange',
      damage: 25,
      cooldown: 2,
      currentCooldown: 0,
      description: 'Swap positions with your shadow for a surprise attack'
    }
  ],
  'Tank Hunter': [
    {
      id: 'shield_bash',
      name: 'Shield Bash',
      damage: 10,
      cooldown: 0,
      currentCooldown: 0,
      description: 'A basic attack with your shield'
    },
    {
      id: 'taunt',
      name: 'Taunt',
      damage: 5,
      cooldown: 2,
      currentCooldown: 0,
      description: 'Force monsters to target you instead of teammates'
    },
    {
      id: 'defensive_stance',
      name: 'Defensive Stance',
      damage: 8,
      cooldown: 3,
      currentCooldown: 0,
      description: 'Increase defense for 2 turns'
    }
  ],
  'Mage Hunter': [
    {
      id: 'fireball',
      name: 'Fireball',
      damage: 15,
      cooldown: 0,
      currentCooldown: 0,
      description: 'Launch a ball of fire at your target'
    },
    {
      id: 'ice_lance',
      name: 'Ice Lance',
      damage: 25,
      cooldown: 2,
      currentCooldown: 0,
      description: 'Pierce your enemy with a lance of ice'
    },
    {
      id: 'lightning_bolt',
      name: 'Lightning Bolt',
      damage: 35,
      cooldown: 3,
      currentCooldown: 0,
      description: 'Strike your enemy with a powerful bolt of lightning'
    }
  ],
  'Healer Hunter': [
    {
      id: 'smite',
      name: 'Smite',
      damage: 8,
      cooldown: 0,
      currentCooldown: 0,
      description: 'A basic attack with divine energy'
    },
    {
      id: 'heal',
      name: 'Heal',
      damage: -40,
      cooldown: 2,
      currentCooldown: 0,
      description: 'Heal a party member for 40 health'
    },
    {
      id: 'group_heal',
      name: 'Group Heal',
      damage: -20,
      cooldown: 4,
      currentCooldown: 0,
      description: 'Heal all party members for 20 health'
    }
  ]
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
      backgroundColor={SHADOW_THEME.cardBackground} 
      borderRadius="medium"
      border="thin"
      borderColor={SHADOW_THEME.border}
    >
      <text color={SHADOW_THEME.textPrimary}>Hunter not found</text>
    </vstack>
  );
  
  // Calculate player rank based on level
  let playerRank = "E";
  if (player.level >= 20) playerRank = "S";
  else if (player.level >= 15) playerRank = "A";
  else if (player.level >= 10) playerRank = "B";
  else if (player.level >= 5) playerRank = "C";
  else if (player.level >= 3) playerRank = "D";
  
  return (
    <vstack 
      padding="medium" 
      backgroundColor={SHADOW_THEME.cardBackground} 
      borderRadius="medium"
      border="thin"
      borderColor={SHADOW_THEME.border}
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large" color={SHADOW_THEME.textPrimary}>{player.username}</text>
        <text 
          color={player.health <= 0 ? SHADOW_THEME.danger : SHADOW_THEME.accent} 
          weight="bold"
        >
          {player.health <= 0 ? "Incapacitated" : `${playerRank}-Rank ${player.class}`}
        </text>
      </hstack>
      
      <hstack gap="medium" padding="small">
        <vstack width="33%">
          <text size="small" color={SHADOW_THEME.textSecondary}>Health</text>
          <text weight="bold" color={SHADOW_THEME.textPrimary}>{player.health}/{player.maxHealth} ❤️</text>
        </vstack>
        <vstack width="33%">
          <text size="small" color={SHADOW_THEME.textSecondary}>Gold</text>
          <text weight="bold" color={SHADOW_THEME.textPrimary}>{player.gold} 💰</text>
        </vstack>
        <vstack width="33%">
          <text size="small" color={SHADOW_THEME.textSecondary}>XP</text>
          <text weight="bold" color={SHADOW_THEME.textPrimary}>{player.experience}/{player.level * 100} 📊</text>
        </vstack>
      </hstack>
      
      <hstack padding="small">
        <vstack width="50%">
          <text size="small" color={SHADOW_THEME.textSecondary}>Weapon</text>
          <text color={SHADOW_THEME.textPrimary}>{player.equipment.weapon?.name || "None"}</text>
        </vstack>
        <vstack width="50%">
          <text size="small" color={SHADOW_THEME.textSecondary}>Armor</text>
          <text color={SHADOW_THEME.textPrimary}>{player.equipment.armor?.name || "None"}</text>
        </vstack>
      </hstack>
      
      {isCurrentPlayer && (
        <vstack paddingTop="small">
          <text size="small" weight="bold" color={SHADOW_THEME.textSecondary}>COMMANDS:</text>
          <text size="small" color={SHADOW_THEME.textPrimary}>/stats - View detailed stats</text>
          <text size="small" color={SHADOW_THEME.textPrimary}>/inventory - View your items</text>
        </vstack>
      )}
    </vstack>
  );
};

const QuestBlock = ({ quest, index, onStartQuest, battleInProgress }) => {
  // Map difficulty to colors
  const difficultyColor = {
    'E-Rank': SHADOW_THEME.success,
    'D-Rank': SHADOW_THEME.primary,
    'C-Rank': SHADOW_THEME.accent,
    'B-Rank': SHADOW_THEME.warning,
    'A-Rank': SHADOW_THEME.danger
  };
  
  return (
    <vstack 
      padding="medium" 
      backgroundColor={SHADOW_THEME.cardBackground} 
      borderRadius="medium"
      border="thin"
      borderColor={SHADOW_THEME.border}
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large" color={SHADOW_THEME.textPrimary}>{quest.name}</text>
        <text 
          color={quest.isComplete ? SHADOW_THEME.success : difficultyColor[quest.difficulty]} 
          weight="bold"
        >
          {quest.isComplete ? "CLEARED" : quest.difficulty}
        </text>
      </hstack>
      
      <text paddingVertical="small" color={SHADOW_THEME.textPrimary}>{quest.description}</text>
      
      <hstack paddingTop="small">
        <vstack width="50%">
          <text size="small" color={SHADOW_THEME.textSecondary}>Reward</text>
          <text color={SHADOW_THEME.textPrimary}>{quest.rewards.gold} gold, {quest.rewards.experience} XP</text>
        </vstack>
        
        <vstack width="50%" alignment="end middle">
          {quest.isComplete ? (
            <hstack backgroundColor={SHADOW_THEME.secondary} padding="small" borderRadius="medium">
              <text color={SHADOW_THEME.success} weight="bold">✓ Gate Cleared</text>
            </hstack>
          ) : (
            <button 
              color="primary" 
              backgroundColor={SHADOW_THEME.primary}
              textColor={SHADOW_THEME.textPrimary}
              disabled={battleInProgress}
              onPress={() => onStartQuest(index)}
            >
              Enter Gate
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
        backgroundColor={SHADOW_THEME.cardBackground} 
        borderRadius="medium"
        border="thin"
        borderColor={SHADOW_THEME.border}
        alignment="middle center"
      >
        <text size="large" weight="bold" color={SHADOW_THEME.textSecondary}>No Active Gate</text>
        <text color={SHADOW_THEME.textSecondary} paddingVertical="small">Enter a gate to begin hunting!</text>
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
      backgroundColor={SHADOW_THEME.cardBackground} 
      borderRadius="medium"
      border="thin"
      borderColor={SHADOW_THEME.border}
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large" color={SHADOW_THEME.danger}>{currentMonster.name}</text>
        <text weight="bold" color={SHADOW_THEME.textPrimary}>Round {gameState.battleState.roundCount}</text>
      </hstack>
      
      <text paddingVertical="small" color={SHADOW_THEME.textPrimary}>{currentMonster.description}</text>
      
      {/* Monster health bar */}
      <vstack paddingVertical="small">
        <hstack alignment="middle space-between">
          <text size="small" color={SHADOW_THEME.textSecondary}>Monster Health</text>
          <text size="small" color={SHADOW_THEME.textPrimary}>{currentMonster.health}/{currentMonster.maxHealth}</text>
        </hstack>
        <hstack width="100%" height="12px" backgroundColor={SHADOW_THEME.secondary} borderRadius="full">
          <hstack 
            width={`${healthPercentage}%`} 
            height="100%" 
            backgroundColor={healthPercentage > 50 ? SHADOW_THEME.success : (healthPercentage > 25 ? SHADOW_THEME.warning : SHADOW_THEME.danger)}
            borderRadius="full"
          />
        </hstack>
      </vstack>
      
      {/* Turn order */}
      <vstack paddingVertical="small">
        <text size="small" weight="bold" color={SHADOW_THEME.textSecondary}>TURN ORDER:</text>
        <hstack gap="small" wrap="wrap">
          {gameState.battleState.turnOrder.map((player, index) => (
            <hstack 
              backgroundColor={index === 0 ? SHADOW_THEME.accent : SHADOW_THEME.secondary}
              padding="xsmall"
              borderRadius="medium"
            >
              <text 
                color={index === 0 ? SHADOW_THEME.textPrimary : SHADOW_THEME.textSecondary}
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
        backgroundColor={SHADOW_THEME.secondary}
        padding="small"
        borderRadius="medium"
        paddingVertical="small"
      >
        <text size="small" weight="bold" color={SHADOW_THEME.textSecondary}>BATTLE LOG:</text>
        {gameState.log.slice(-2).map(entry => (
          <text size="small" color={SHADOW_THEME.textPrimary}>{entry}</text>
        ))}
      </vstack>
      
      {/* Battle commands */}
      {isPlayerTurn && (
        <vstack paddingTop="small">
          <text size="small" weight="bold" color={SHADOW_THEME.textSecondary}>YOUR TURN! COMMANDS:</text>
          <text size="small" color={SHADOW_THEME.textPrimary}>/attack - Basic attack</text>
          {currentUser?.skills.map(skill => (
            <text size="small" color={SHADOW_THEME.textPrimary}>/attack {skill.name} - {skill.description}</text>
          ))}
          {currentUser?.class === 'Healer Hunter' && <text size="small" color={SHADOW_THEME.textPrimary}>/heal [player] - Heal a party member</text>}
        </vstack>
      )}
    </vstack>
  );
};

const ShopBlock = ({ shopItems, playerGold }) => {
  return (
    <vstack 
      padding="medium" 
      backgroundColor={SHADOW_THEME.cardBackground} 
      borderRadius="medium"
      border="thin"
      borderColor={SHADOW_THEME.border}
    >
      <hstack alignment="middle space-between">
        <text weight="bold" size="large" color={SHADOW_THEME.textPrimary}>Hunter Association Shop</text>
        <text color={SHADOW_THEME.textPrimary}>Your Gold: {playerGold || 0} 💰</text>
      </hstack>
      
      <vstack paddingVertical="small" gap="small">
        {shopItems?.slice(0, 3).map(item => (
          <hstack 
            backgroundColor={SHADOW_THEME.secondary}
            padding="small"
            borderRadius="medium"
            gap="small"
          >
            <vstack width="70%">
              <text weight="bold" color={SHADOW_THEME.textPrimary}>{item.name}</text>
              <text size="small" color={SHADOW_THEME.textPrimary}>{item.description}</text>
              {item.power && <text size="small" color={SHADOW_THEME.textPrimary}>Power: {item.power}</text>}
            </vstack>
            
            <vstack width="30%" alignment="end middle">
              <text weight="bold" color={SHADOW_THEME.textPrimary}>{item.value} 💰</text>
              <text size="small" color={SHADOW_THEME.textSecondary}>Type: {item.type}</text>
            </vstack>
          </hstack>
        ))}
      </vstack>
      
      <vstack paddingTop="small">
        <text size="small" weight="bold" color={SHADOW_THEME.textSecondary}>COMMANDS:</text>
        <text size="small" color={SHADOW_THEME.textPrimary}>/shop - View all items</text>
        <text size="small" color={SHADOW_THEME.textPrimary}>/buy [item] - Purchase an item</text>
      </vstack>
    </vstack>
  );
};

const JoinBlock = ({ gameState, selectedClass, setSelectedClass, handleJoinGame, handleReady, userId }) => {
  return (
    <vstack 
      padding="medium" 
      backgroundColor={SHADOW_THEME.cardBackground} 
      borderRadius="medium"
      border="thin"
      borderColor={SHADOW_THEME.border}
      alignment="center middle"
    >
      <text size="large" weight="bold" color={SHADOW_THEME.accent}>Become a Hunter</text>
      <text size="small" paddingVertical="small" color={SHADOW_THEME.textPrimary}>Hunters: {gameState?.players.length || 0}/4</text>
      
      {(!gameState?.players.length || gameState.players.length < 4) && 
        !gameState?.players.find(p => p.id === userId) ? (
        <vstack gap="medium" width="100%" alignment="center middle">
          <text color={SHADOW_THEME.textPrimary}>Choose your hunter class:</text>
          <hstack gap="small" wrap="wrap">
            {['Shadow Monarch', 'Tank Hunter', 'Mage Hunter', 'Healer Hunter'].map((cls) => (
              <button 
                color={selectedClass === cls ? 'primary' : 'secondary'}
                backgroundColor={selectedClass === cls ? SHADOW_THEME.accent : SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setSelectedClass(cls)}
              >
                {cls}
              </button>
            ))}
          </hstack>
          <button 
            color="primary" 
            backgroundColor={SHADOW_THEME.accent}
            textColor={SHADOW_THEME.textPrimary}
            onPress={handleJoinGame}
          >
            Start Hunting
          </button>
        </vstack>
      ) : (
        <vstack gap="medium" width="100%" alignment="center middle">
          {gameState?.players.find(p => p.id === userId && !p.isReady) ? (
            <button 
              backgroundColor={SHADOW_THEME.accent}
              textColor={SHADOW_THEME.textPrimary}
              onPress={handleReady}
            >
              Ready Up
            </button>
          ) : (
            <text color={SHADOW_THEME.textPrimary}>
              {gameState?.players.filter(p => p.isReady).length || 0}/{gameState?.players.length || 0} Hunters Ready
            </text>
          )}
          <text color={SHADOW_THEME.textPrimary}>Waiting for all hunters to be ready...</text>
        </vstack>
      )}
    </vstack>
  );
};

// Reddit-themed custom post type for the game
Devvit.addCustomPostType({
  name: 'Level Maxing',
  height: 'tall',
  render: (context) => {
    // State variables 
    const [gameState, setGameState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState('Shadow Monarch');
    const [activePage, setActivePage] = useState('main'); // main, profile, quests, shop, party
    
    // Sync with Redis storage
    useInterval(async () => {
      try {
        if (!context.postId) return;
        
        const storedState = await context.redis.get(`sololeveling_${context.postId}`);
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
          
          await context.redis.set(`sololeveling_${context.postId}`, JSON.stringify(newGameState));
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
      
      await context.redis.set(`sololeveling_${context.postId}`, JSON.stringify(updatedState));
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
        gameStarted: allReady && updatedPlayers.length >= 1 // Allow solo play
      };
      
      await context.redis.set(`sololeveling_${context.postId}`, JSON.stringify(updatedState));
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
          `Gate Opened: **${quest.name}**`,
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
      
      await context.redis.set(`sololeveling_${context.postId}`, JSON.stringify(updatedState));
      setGameState(updatedState);
      
      // Post a comment to start the battle
      await context.reddit.submitComment({
        text: `# Gate: ${quest.name} - Hunter Entry!

${quest.description}

You encounter a **${quest.monsters[0].name}**!
${quest.monsters[0].description}

## Battle Commands:
- \`/attack\` - Use default attack
- \`/attack [skill]\` - Use a specific skill
- \`/heal [player]\` - Heal a hunter (Healer Hunters only)

First hunter to act: **${updatedState.battleState.turnOrder[0]}**`,
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
          `The hunters return to the Association and recover to full health.`
        ]
      };
      
      await context.redis.set(`sololeveling_${context.postId}`, JSON.stringify(updatedState));
      setGameState(updatedState);
      
      await context.reddit.submitComment({
        text: `# Hunters' Rest
The hunters return to the Association headquarters. All hunters have recovered to full health.`,
        id: context.postId
      });
    };
    
    // Show loading state if data isn't ready
    if (!context.postId || isLoading) {
      return (
        <vstack alignment="middle center" height="100%" backgroundColor={SHADOW_THEME.background}>
          <text size="large" color={SHADOW_THEME.textPrimary}>Loading Level Maxing...</text>
        </vstack>
      );
    }
    
    // Get current user's player data
    const currentUser = gameState?.players.find(p => p.id === context.userId);
    
    // Show lobby if game hasn't started
    if (!gameState?.gameStarted) {
      return (
        <vstack backgroundColor={SHADOW_THEME.background}>
          {/* Shadow-themed header */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor={SHADOW_THEME.headerBackground} 
            borderRadius="small"
            gap="small"
          >
            <text weight="bold" color={SHADOW_THEME.accent}>Level Maxing - Lobby</text>
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
        <vstack gap="small" backgroundColor={SHADOW_THEME.background}>
          {/* Shadow-themed header with navigation tabs */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor={SHADOW_THEME.headerBackground} 
            borderRadius="small"
            gap="small"
            alignment="middle space-between"
          >
            <text weight="bold" color={SHADOW_THEME.accent}>Level Maxing</text>
            
            <hstack gap="small">
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.accent}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('main')}
              >
                Main
              </button>
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('quests')}
              >
                Gates
              </button>
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('party')}
              >
                Hunters
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
    
    // Gates page
    if (activePage === 'quests') {
      return (
        <vstack gap="small" backgroundColor={SHADOW_THEME.background}>
          {/* Shadow-themed header with navigation tabs */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor={SHADOW_THEME.headerBackground} 
            borderRadius="small"
            gap="small"
            alignment="middle space-between"
          >
            <text weight="bold" color={SHADOW_THEME.accent}>Level Maxing - Gates</text>
            
            <hstack gap="small">
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('main')}
              >
                Main
              </button>
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.accent}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('quests')}
              >
                Gates
              </button>
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('party')}
              >
                Hunters
              </button>
            </hstack>
          </hstack>
          
          {/* Gates list */}
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
              backgroundColor={SHADOW_THEME.cardBackground} 
              borderRadius="medium"
              border="thin"
              borderColor={SHADOW_THEME.border}
              alignment="middle center"
            >
              <button 
                backgroundColor={SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={handleRest}
                disabled={gameState?.battleState.isActive}
              >
                Return to Association (Recover HP)
              </button>
            </vstack>
          </vstack>
        </vstack>
      );
    }
    
    // Hunters page
    if (activePage === 'party') {
      return (
        <vstack gap="small" backgroundColor={SHADOW_THEME.background}>
          {/* Shadow-themed header with navigation tabs */}
          <hstack 
            width="100%" 
            padding="small" 
            backgroundColor={SHADOW_THEME.headerBackground} 
            borderRadius="small"
            gap="small"
            alignment="middle space-between"
          >
            <text weight="bold" color={SHADOW_THEME.accent}>Level Maxing - Hunters</text>
            
            <hstack gap="small">
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('main')}
              >
                Main
              </button>
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.secondary}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('quests')}
              >
                Gates
              </button>
              <button 
                size="small" 
                backgroundColor={SHADOW_THEME.accent}
                textColor={SHADOW_THEME.textPrimary}
                onPress={() => setActivePage('party')}
              >
                Hunters
              </button>
            </hstack>
          </hstack>
          
          {/* Hunters members list */}
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
              backgroundColor={SHADOW_THEME.cardBackground} 
              borderRadius="medium"
              border="thin"
              borderColor={SHADOW_THEME.border}
            >
              <text weight="bold" color={SHADOW_THEME.textPrimary}>Hunter Association Stats</text>
              <hstack paddingTop="small">
                <vstack width="33%">
                  <text size="small" color={SHADOW_THEME.textSecondary}>Total Hunters</text>
                  <text weight="bold" color={SHADOW_THEME.textPrimary}>{gameState.players.length}</text>
                </vstack>
                <vstack width="33%">
                  <text size="small" color={SHADOW_THEME.textSecondary}>Active Hunters</text>
                  <text weight="bold" color={SHADOW_THEME.textPrimary}>{gameState.players.filter(p => p.health > 0).length}</text>
                </vstack>
                <vstack width="33%">
                  <text size="small" color={SHADOW_THEME.textSecondary}>Average Rank</text>
                  <text weight="bold" color={SHADOW_THEME.textPrimary}>
                    {(() => {
                      const avgLevel = Math.round(gameState.players.reduce((acc, p) => acc + p.level, 0) / gameState.players.length);
                      let rank = "E";
                      if (avgLevel >= 20) rank = "S";
                      else if (avgLevel >= 15) rank = "A";
                      else if (avgLevel >= 10) rank = "B";
                      else if (avgLevel >= 5) rank = "C";
                      else if (avgLevel >= 3) rank = "D";
                      return rank;
                    })()}
                  </text>
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
  label: 'Create New Level Maxing Game',
  location: 'subreddit',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    const subreddit = await reddit.getCurrentSubreddit();
    
    const post = await reddit.submitPost({
      title: 'Level Maxing',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center" backgroundColor={SHADOW_THEME.background}>
          <text size="large" color={SHADOW_THEME.accent}>Loading Level Maxing...</text>
        </vstack>
      ),
    });
    
    ui.showToast({ text: 'A new Gate has opened!' });
    ui.navigateTo(post);
  },
});

// Event handler for comment commands
Devvit.addTrigger({
  event: 'CommentCreate',
  async onEvent(event, context) {
    if (!event.comment?.postId) return;
    const storedState = await context.redis.get(`sololeveling_${event.comment.postId}`);
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
          text: `@${user.username} You must be a registered hunter to use commands.`,
          id: comment.parentId
        });
        return;
      }
      
      // Non-battle commands that can be used anytime
      if (command === 'help') {
        await context.reddit.submitComment({
          text: `# Level Maxing Commands
          
**Battle Commands:**
- \`/attack\` - Use default attack
- \`/attack [skill_name]\` - Use a specific skill
- \`/heal [player_name]\` - Heal a hunter (Healer Hunters only)

**Association Commands:**
- \`/shop\` - View available items in the shop
- \`/buy [item_name]\` - Purchase an item from the shop
- \`/inventory\` - View your inventory
- \`/equip [item_name]\` - Equip an item from your inventory
- \`/stats\` - View your hunter stats

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
                text: `@${user.username} It's not your turn to attack!`,
                id: comment.parentId
              });
              return;
            }
            
            // Process attack
            const attackingPlayer = gameState.players[playerIndex];
            const attackQuest = gameState.quests[gameState.currentQuest];
            const attackMonster = attackQuest.monsters[attackQuest.currentMonsterIndex];
            
            let damage = 0;
            let skillName = "basic attack";
            const skillMatch = args.match(/^(\w+)$/);
            
            if (skillMatch) {
              const skillNameInput = skillMatch[1].toLowerCase();
              const skill = attackingPlayer.skills.find(s => s.name.toLowerCase() === skillNameInput);
              
              if (skill) {
                if (skill.currentCooldown > 0) {
                  await context.reddit.submitComment({
                    text: `@${user.username} Skill **${skill.name}** is on cooldown for ${skill.currentCooldown} more turns!`,
                    id: comment.parentId
                  });
                  return;
                }
                
                damage = skill.damage + (attackingPlayer.equipment.weapon?.power || 0);
                skillName = skill.name;
                
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
            
            // Special Shadow Monarch bonus damage - growing stronger as they level
            if (attackingPlayer.class === 'Shadow Monarch') {
              // Bonus damage scales with level
              const shadowBonus = Math.floor(attackingPlayer.level * 1.5);
              damage += shadowBonus;
              gameState.log.push(`*Shadow power grants ${shadowBonus} bonus damage!*`);
            }
            
            // Apply damage to monster
            attackMonster.health -= damage;
            
            // Update game log
            gameState.log.push(`**${attackingPlayer.username}** (${attackingPlayer.class}) used ${skillName} for ${damage} damage on **${attackMonster.name}**!`);
            
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
                  
                  // Recalculate rank
                  let newRank = "E";
                  if (gameState.players[i].level >= 20) newRank = "S";
                  else if (gameState.players[i].level >= 15) newRank = "A";
                  else if (gameState.players[i].level >= 10) newRank = "B";
                  else if (gameState.players[i].level >= 5) newRank = "C";
                  else if (gameState.players[i].level >= 3) newRank = "D";
                  
                  gameState.log.push(`**${p.username}** is now a ${newRank}-Rank Hunter!`);
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
                  
                  // Extra level up check after quest completion
                  if (gameState.players[i].experience >= gameState.players[i].level * 100) {
                    gameState.players[i].level += 1;
                    gameState.players[i].maxHealth += 10;
                    gameState.players[i].health = gameState.players[i].maxHealth;
                    gameState.log.push(`**${p.username}** leveled up to level ${gameState.players[i].level}!`);
                    
                    // Recalculate rank again
                    let newRank = "E";
                    if (gameState.players[i].level >= 20) newRank = "S";
                    else if (gameState.players[i].level >= 15) newRank = "A";
                    else if (gameState.players[i].level >= 10) newRank = "B";
                    else if (gameState.players[i].level >= 5) newRank = "C";
                    else if (gameState.players[i].level >= 3) newRank = "D";
                    
                    gameState.log.push(`**${p.username}** is now a ${newRank}-Rank Hunter!`);
                  }
                });
                
                gameState.log.push(`**Gate Cleared**: ${attackQuest.name}`);
                gameState.log.push(`Each hunter earned ${questExpPerPlayer} XP and ${questGoldPerPlayer} gold!`);
                
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
              
              // Tank Hunter damage reduction special ability
              if (targetPlayer.class === 'Tank Hunter') {
                const damageReduction = Math.floor(targetPlayer.level * 0.5);
                monsterDamage = Math.max(1, monsterDamage - damageReduction);
                gameState.log.push(`*${targetPlayer.username}'s defensive ability reduces damage by ${damageReduction}!*`);
              }
              
              // Monster deals damage
              targetPlayer.health -= monsterDamage;
              gameState.log.push(`**${attackMonster.name}** attacks **${targetPlayer.username}** for ${monsterDamage} damage!`);
              
              // Check if player is knocked out
              if (targetPlayer.health <= 0) {
                gameState.players[targetIndex].health = 0;
                gameState.log.push(`**${targetPlayer.username}** has been incapacitated!`);
                
                // Check if all players are knocked out
                const allKnockedOut = gameState.players.every(p => p.health <= 0);
                if (allKnockedOut) {
                  gameState.battleState.isActive = false;
                  gameState.log.push(`**Party Wiped**: All hunters have been defeated!`);
                  gameState.log.push(`The hunters must return to the Association and recover before attempting another gate.`);
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
            const healSkill = healingPlayer.skills.find(s => s.name.toLowerCase() === 'heal' || s.name.toLowerCase() === 'group_heal');
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
            
            // Group heal affects all players
            if (healSkill.name.toLowerCase() === 'group_heal') {
              // Apply healing to all players
              const healAmount = Math.abs(healSkill.damage);
              
              gameState.players.forEach((p, i) => {
                if (p.health > 0) {  // Only heal living players
                  gameState.players[i].health = Math.min(
                    gameState.players[i].health + healAmount,
                    gameState.players[i].maxHealth
                  );
                }
              });
              
              // Set cooldown
              const skillIndex = healingPlayer.skills.findIndex(s => s.id === healSkill.id);
              healingPlayer.skills[skillIndex].currentCooldown = healSkill.cooldown;
              
              gameState.log.push(`**${healingPlayer.username}** casts Group Heal, restoring ${healAmount} health to all hunters!`);
            } else {
              // Find target player for individual heal
              const targetName = args.trim();
              const targetIndex = gameState.players.findIndex(p => p.username.toLowerCase() === targetName.toLowerCase());
              
              if (targetIndex === -1) {
                await context.reddit.submitComment({
                  text: `@${user.username} Hunter "${targetName}" not found in your party.`,
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
            }
            
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
              text: `# Hunter Association Shop
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
                const healAmount = equipItem.power || 50;
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
            
            // Calculate player rank based on level
            let playerRank = "E";
            if (statsPlayer.level >= 20) playerRank = "S";
            else if (statsPlayer.level >= 15) playerRank = "A";
            else if (statsPlayer.level >= 10) playerRank = "B";
            else if (statsPlayer.level >= 5) playerRank = "C";
            else if (statsPlayer.level >= 3) playerRank = "D";
            
            await context.reddit.submitComment({
              text: `# ${statsPlayer.username}'s Hunter Profile

**Level ${statsPlayer.level} ${playerRank}-Rank ${statsPlayer.class}**

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
      await context.redis.set(`sololeveling_${event.comment.postId}`, JSON.stringify(gameState));
      
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
