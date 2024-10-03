# Organization Unit

No description.

_Attributes_

* Name : `String` - No description.



_Reverse Associations_

* Employees : `[]Employee` (mapped by `Employee :: Org Unit`) - Employees in the org unit


# Employee

An employee

_Attributes_

* First Name : `String` - No description.
* Last Name : `String` - No description.
* Birth Date : `LocalDate` - No description.
* Last Seen At : `Instant` - No description.


_Associations_

* Org Unit : `Organization Unit` - Org unit of employee



# Shift

No description.

_Attributes_

* Begins At : `LocalTime` - No description.
* Ends At : `LocalTime` - No description.




