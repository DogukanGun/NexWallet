type Character = {
  name: string;
  description: string;
};

type CharacterSelectionProps = {
  characters: Character[];
  selectedCharacter: string | null;
  onCharacterSelect: (character: string) => void;
  loadingCharacters: boolean;
};

export const CharacterSelection = ({
  characters,
  selectedCharacter,
  onCharacterSelect,
  loadingCharacters
}: CharacterSelectionProps) => {
  if (loadingCharacters) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
        <p className="mt-2 text-gray-400">Loading characters...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {characters.map((character) => (
        <button
          key={character.name}
          className={`p-3 rounded-lg border text-sm 
            ${selectedCharacter === character.name 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700'
            }`}
          onClick={() => onCharacterSelect(character.name)}
        >
          <div className="text-left">
            <div>{character.name}</div>
            <div className="text-xs mt-1 opacity-75">{character.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}; 