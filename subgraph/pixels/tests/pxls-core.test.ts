import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, Bytes } from "@graphprotocol/graph-ts"
import { Conjured } from "../generated/schema"
import { Conjured as ConjuredEvent } from "../generated/PxlsCore/PxlsCore"
import { handleConjured } from "../src/pxls-core"
import { createConjuredEvent } from "./pxls-core-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let to = Address.fromString("0x0000000000000000000000000000000000000001")
    let pixels = Bytes.fromI32(1234567890)
    let newConjuredEvent = createConjuredEvent(to, pixels)
    handleConjured(newConjuredEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("Conjured created and stored", () => {
    assert.entityCount("Conjured", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "Conjured",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "to",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "Conjured",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "pixels",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
