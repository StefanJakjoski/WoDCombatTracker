using System.Security.Cryptography.X509Certificates;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Backend.Api.Models;

public enum DamageType
{
    None = 0,
    Bashing = 1,
    Lethal = 2,
    Aggravated = 3
}

public enum CharacterTypes
{
    mortal,
    werewolf,
    vampire,
    mage,
    fomor
}

public class CombatStats(int soak = 3, int baseInitiative = 6, int dodge = 5)
{
    //static stats (don't change throughout combat except at beginning)
    public int Soak { get; set; } = soak;
    public int BaseInitiative { get; set; } = baseInitiative;
    public int Dodge { get; set; } = dodge;

    //dynamic stats
    public int CurrentInitiative { get; set; } = baseInitiative;
    public bool isActive { get; set; } = false;
}

public class HealthTrack
{
    public DamageType[] Levels { get; set; } = [];

    //to get the json deserializer to stop bitching
    public HealthTrack()
    {
        Levels = new DamageType[7];
    }

    public HealthTrack(int levels = 7)
    {
        Levels = new DamageType[levels];
    }

    [JsonIgnore]
    public int Bashing => (Levels ?? []).Count(d => d == DamageType.Bashing);
    [JsonIgnore]
    public int Lethal => (Levels ?? []).Count(d => d == DamageType.Lethal);
    [JsonIgnore]
    public int Aggravated => (Levels ?? []).Count(d => d == DamageType.Aggravated);

    [JsonIgnore]
    public bool IsIncapacitated => (Levels ?? []).All(d => d != DamageType.None);
    [JsonIgnore]
    public bool IsDead => (Levels ?? []).All(d => d == DamageType.Aggravated);

    public void ApplyDamage(DamageType type, int amount = 1)
    {
        for (int i = 0; i < amount; i++)
            ApplySingle(type);
    }

    public void Heal(DamageType type, int amount = 1)
    {
        for (int i = 0; i < amount; i++)
        {
            switch (type)
            {
                case DamageType.Bashing:
                    HealBashing();
                    break;

                case DamageType.Lethal:
                    HealLethal();
                    break;

                case DamageType.Aggravated:
                    HealAggravated();
                    break;
            }
        }
    }

    private void HealBashing()
    {
        int last = Last(DamageType.Bashing);

        if (last != -1)
            Levels[last] = DamageType.None;
    }

    private void HealLethal()
    {
        int last = Last(DamageType.Lethal);

        if (last != -1)
            Levels[last] = DamageType.None;

        Compact();
    }

    private void HealAggravated()
    {
        int last = Last(DamageType.Aggravated);

        if (last != -1)
            Levels[last] = DamageType.None;

        Compact();
    }

    private void ApplySingle(DamageType type)
    {
        switch (type)
        {
            case DamageType.Bashing:
                ApplyBashing();
                break;

            case DamageType.Lethal:
                ApplyLethal();
                break;

            case DamageType.Aggravated:
                ApplyAggravated();
                break;
        }
    }

    private void ApplyBashing()
    {
        //empty health box?
        int empty = First(DamageType.None);

        if (empty != -1)
        {
            Levels[empty] = DamageType.Bashing;
            return;
        }

        //no empty boxes, upgrade the last bashing to lethal
        int firstBash = First(DamageType.Bashing);

        if (firstBash != -1)
        {
            Levels[firstBash] = DamageType.Lethal;
            return;
        }

        //no bashing left, overflow to lethal
        ApplyLethal();
    }

    private void ApplyLethal()
    {
        int firstBash = First(DamageType.Bashing);
        if(firstBash != -1)
        {
            ShiftRight(firstBash);
            Levels[firstBash] = DamageType.Lethal;
            return;
        }

        int empty = First(DamageType.None);

        if (empty != -1)
        {
            Levels[empty] = DamageType.Lethal;
            return;
        }

        ApplyAggravated();

        /*
        int empty = First(DamageType.None);

        if (empty != -1)
        {
            ShiftRight(empty);
            Levels[empty] = DamageType.Lethal;
            return;
        }

        int firstBash = First(DamageType.Bashing);

        if (firstBash != -1)
        {
            ShiftRight(firstBash);
            Levels[firstBash] = DamageType.Lethal;
            return;
        }

        //all lethal/aggravated
        ApplyAggravated();
        */
    }

    private void ApplyAggravated()
    {
        int firstNonAgg = FirstNonAgg();

        if (firstNonAgg == -1)
            throw new InvalidOperationException("Health track is full of aggravated damage.");

        ShiftRight(firstNonAgg);
        Levels[firstNonAgg] = DamageType.Aggravated;
    }

    /// <summary>
    /// Pushes everything one box to the right, dropping the final box.
    /// </summary>
    private void ShiftRight(int index)
    {
        for (int i = Levels.Length - 1; i > index; i--)
            Levels[i] = Levels[i - 1];
    }

    private int First(DamageType type)
    {
        for (int i = 0; i < Levels.Length; i++)
            if (Levels[i] == type)
                return i;

        return -1;
    }

    private int Last(DamageType type)
    {
        for (int i = Levels.Length - 1; i >= 0; i--)
            if (Levels[i] == type)
                return i;

        return -1;
    }

    private int FirstNonAgg()
    {
        for (int i = 0; i < Levels.Length; i++)
            if (Levels[i] != DamageType.Aggravated)
                return i;

        return -1;
    }

    private void Compact()
    {
        var damage = Levels.Where(d => d != DamageType.None).ToList();

        Array.Fill(Levels, DamageType.None);

        for (int i = 0; i < damage.Count; i++)
            Levels[i] = damage[i];
    }

    public override string ToString()
    {
        return string.Join(" ",
            Levels.Select(d => d switch
            {
                DamageType.None => "[ ]",
                DamageType.Bashing => "[B]",
                DamageType.Lethal => "[L]",
                DamageType.Aggravated => "[A]",
                _ => "[?]"
            }));
    }
}

public class ResourceTrack(int current = 5, int maximum = 10)
{
    public int Current { get; set; } = current;

    public int Maximum { get; set; } = maximum;

    public void SetCurrent(int amount)
    {
        Current = amount;
        if(Current < 0)
            Current = 0;

        if(Current > Maximum)
            Current = Maximum;
    }

    public void SetMaximum(int amount)
    {
        Maximum = amount;
        if(Maximum < 1)
            Maximum = 1;

        if(Current > Maximum)
            Current = Maximum;
    }

    public void Restore(int amount)
    {
        Current += amount;
        if(Current > Maximum)
            Current = Maximum;
    }

    public void Subtract(int amount)
    {
        Current -= amount;
        if(Current < 0)
            Current = 0;
    }

    public void IncreaseMaximum(int amount)
    {
        Maximum += amount;
        if(Maximum <= 0)
            Maximum = 1;
    }

    public void DecreaseMaximum(int amount)
    {
        Maximum -= amount;
        if(Maximum <= 0)
            Maximum = 1;

        if(Current > Maximum)
            Current = Maximum;
    }
}


//[JsonPolymorphic(TypeDiscriminatorPropertyName = "$type")]
[JsonPolymorphic(TypeDiscriminatorPropertyName = "type")]
[JsonDerivedType(typeof(WerewolfCharacter), "werewolf")]
[JsonDerivedType(typeof(VampireCharacter), "vampire")]
[JsonDerivedType(typeof(FomorCharacter), "fomor")]
[BsonDiscriminator("mortal", RootClass = true)]
[BsonKnownTypes(
    typeof(WerewolfCharacter),
    typeof(FomorCharacter),
    typeof(VampireCharacter)
)]
public class Character{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = "";

    [BsonRepresentation(BsonType.ObjectId)]
    public string SessionId { get; set; } = "";

    public string Name { get; set; } = "";

    // werewolf, mortal, vampire, mage, etc...
    public string CharacterType => this switch
    {
        WerewolfCharacter => CharacterTypes.werewolf.ToString(),
        VampireCharacter => CharacterTypes.vampire.ToString(),
        FomorCharacter => CharacterTypes.fomor.ToString(),
        _ => CharacterTypes.mortal.ToString()
    };

    // pc, npc, ally, enemy, etc...
    public string Category { get; set; } = "";

    public HealthTrack Health { get; set; } = new();      // [A, L, L, B, B, [], []]  agg, lethal, bashing, nothing

    public ResourceTrack Willpower { get; set; } = new();

    public CombatStats CombatStats { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

[BsonDiscriminator("werewolf")]
public class WerewolfCharacter : Character
{
    public string Breed { get; set; } = "";

    public string Auspice { get; set; } = "";

    public string Tribe { get; set; } = "";

    public ResourceTrack Rage { get; set; } = new();

    public ResourceTrack Gnosis { get; set; } = new();

    public List<string> Gifts { get; set; } = [];
}

[BsonDiscriminator("fomor")]
public class FomorCharacter : Character
{
    //thing responsible for possession/corruption of the character
    public string Bane { get; set; } = "";

    public List<string> Powers { get; set; } = [];

    //optional physical/mental manifestations of corruption
    public string Corruption { get; set; } = "";
}

[BsonDiscriminator("vampire")]
public class VampireCharacter : Character
{
    public ResourceTrack BloodPool { get; set; } = new();

    public List<string> Powers { get; set; } = [];
}


//helpers for character creation:
public class CharacterCreateDto
{
    public string SessionId { get; set; } = "";
    public string Name { get; set; } = "";
    public string CharacterType { get; set; } = "";
    public string Category { get; set; } = "";

    //public HealthTrack Health { get; set; } = new();
    public int Willpower { get; set; } = 0;

    public int Soak { get; set; } = 0;
    public int Initiative { get; set; } = 0;
    public int Dodge { get; set; } = 0;
}

public class WerewolfCharacterCreateDto : CharacterCreateDto
{
    public string Breed { get; set; } = "";
    public string Auspice { get; set; } = "";
    public string Tribe { get; set; } = "";

    public int Rage { get; set; } = 0;
    public int Gnosis { get; set; } = 0;

    public List<string> Gifts { get; set; } = [];
}

public class FomorCharacterCreateDto : CharacterCreateDto
{
    public string Bane { get; set; } = "";

    public List<string> Powers { get; set; } = [];

    public string Corruption { get; set; } = "";
}

public class VampireCharacterCreateDto : CharacterCreateDto
{
    public int BloodPool { get; set; } = 0;

    public List<string> Powers { get; set; } = [];
}
