import enum

class CouponStatus(str, enum.Enum):
    GENERATED = "generated"
    CLICKED = "clicked"
    PLACED = "placed"
    NOT_PLACED = "not_placed"
    EXPIRED = "expired"

class BetResult(str, enum.Enum):
    PENDING = "pending"
    WON = "won"
    LOST = "lost"
    VOID = "void"
    CASHOUT = "cashout"
