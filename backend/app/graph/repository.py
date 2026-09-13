from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.graph.models import Entity, Relationship


async def get_or_create_entity(db: AsyncSession, name: str, user_id, entity_type: str = "person") -> Entity:
    result = await db.execute(
        select(Entity).where(
            Entity.name == name, Entity.entity_type == entity_type, Entity.user_id == user_id
        )
    )
    entity = result.scalar_one_or_none()
    if entity:
        return entity

    entity = Entity(name=name, entity_type=entity_type, user_id=user_id)
    db.add(entity)
    await db.commit()
    await db.refresh(entity)
    return entity


async def get_or_create_self(db: AsyncSession, user_id) -> Entity:
    return await get_or_create_entity(db, name="من", entity_type="self", user_id=user_id)


async def create_relationship(db: AsyncSession, source_id, target_id, relation_type: str, user_id) -> Relationship:
    rel = Relationship(
        source_entity_id=source_id,
        target_entity_id=target_id,
        relation_type=relation_type,
        user_id=user_id,
    )
    db.add(rel)
    await db.commit()
    await db.refresh(rel)
    return rel