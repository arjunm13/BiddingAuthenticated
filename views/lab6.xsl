<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
       <xs:element name="postingsData">
              <xs:complexType>
                     <xs:sequence>
                            <xs:element name="category" maxOccurs="unbounded">
                                   <xs:complexType>
                                          <xs:sequence>
                                                 <xs:element name="categoryName" type="xs:string"></xs:element>
                                             </xs:sequence>
                                      </xs:complexType>
                               </xs:element>
                            <xs:element name="item" maxOccurs="unbounded">
                                   <xs:complexType>
                                          <xs:sequence>
                                                 <xs:element name="itemName" type="xs:string"></xs:element>
                                                 <xs:element name="categoryName" type="xs:string"></xs:element>
                                                 <xs:element name="itemModel" type="xs:string"></xs:element>
                                             </xs:sequence>
                                      </xs:complexType>
                               </xs:element>
                            <xs:element name="city" maxOccurs="unbounded">
                                   <xs:complexType>
                                          <xs:sequence>
                                                 <xs:element name="cityName" type="xs:string"></xs:element>
                                                 <xs:element name="province" type="xs:string"></xs:element>
                                                 <xs:element name="country" type="xs:string"></xs:element>
                                                 <xs:element name="cityID" type="xs:int"></xs:element>
                                             </xs:sequence>
                                      </xs:complexType>
                               </xs:element>
                            <xs:element name="user" maxOccurs="unbounded">
                                   <xs:complexType>
                                          <xs:sequence>
                                                 <xs:element name="email" type="xs:string"></xs:element>
                                                 <xs:element name="firstName" type="xs:string"></xs:element>
                                                 <xs:element name="lastName" type="xs:string"></xs:element>
                                                 <xs:element name="cityID" type="xs:int"></xs:element>
                                             </xs:sequence>
                                      </xs:complexType>
                               </xs:element>
                            <xs:element name="posting" maxOccurs="unbounded">
                                   <xs:complexType>
                                          <xs:sequence>
                                                 <xs:element name="postingID" type="xs:int"></xs:element>
                                                 <xs:element name="itemName" type="xs:string"></xs:element>
                                                 <xs:element name="postDescription" type="xs:string"></xs:element>
                                                 <xs:element name="buySell" type="xs:string"></xs:element>
                                                 <xs:element name="email" type="xs:string"></xs:element>
                                                 <xs:element name="postPrice" type="xs:int"></xs:element>
                                                 <xs:element name="postAddress" type="xs:string"></xs:element>
                                                 <xs:element name="cityID" type="xs:int"></xs:element>
                                                 <xs:element name="postDATE" type="xs:int"></xs:element>
                                                 <xs:element name="postViews" type="xs:int"></xs:element>
                                             </xs:sequence>
                                      </xs:complexType>
                               </xs:element>
                        </xs:sequence>
                 </xs:complexType>
          </xs:element>
   </xs:schema>