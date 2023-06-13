from typing import NotRequired, TypedDict


class SessionDTO(TypedDict):
    id: int
    user_is_owner: bool


class PlayerDTO(TypedDict):
    username: str
    selection: NotRequired[int | None]


class TaskDTO(TypedDict):
    id: int
    summary: str
    estimation: int | None


class StoryDTO(TypedDict):
    id: int
    summary: str
    description: str
    tasks: list[TaskDTO]


class SessionDetailsDTO(SessionDTO):
    players: list[PlayerDTO]
    stories: list[StoryDTO]
